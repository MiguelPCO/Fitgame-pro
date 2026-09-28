# 06 — Modelo de datos: cambios propuestos

> **Propuesta. No se ha ejecutado ningún SQL ni creado ninguna migración.** El esquema actual está descrito en `00-estado-actual.md` §4. Todo lo de aquí es diseño; lo que es criterio mío va marcado **[estimado]**.

---

## Los cuatro problemas que resolver

El esquema actual (`supabase/schema.sql` + 7 migraciones) es sólido para gimnasio, pero tiene cuatro huecos que bloquean el rediseño:

1. **No hay fechas.** `profiles.weekly_schedule` es un JSONB de día-de-semana a id de plantilla. Un calendario de verdad necesita sesiones con **fecha real**, para poder reprogramar el martes 14 sin tocar "todos los martes".
2. **No hay running.** `workout_sessions.exercises` es JSONB de series de fuerza. No hay distancia, ritmo, ni tipo de sesión de carrera.
3. **No hay plan.** No existe entidad "plan de entrenamiento con objetivo y fecha de carrera". La periodización vive en `localStorage`.
4. **Media gamificación vive en el navegador.** Badges, retos semanales, congeladores de racha y periodización se guardan en `localStorage` (`lib/constants.ts:33-48`: `BADGES`, `WEEKLY_CHALLENGE`, `STREAK_FREEZES`, `PERIODIZATION`). Se pierden al cambiar de dispositivo y son triviales de falsear desde DevTools — incoherente con el esfuerzo ya hecho de mover el XP al servidor.

---

## Principios de la propuesta

- **No romper lo que funciona.** `workout_sessions`, `templates` y `personal_records` se conservan; se añaden columnas, no se reescriben.
- **Todo lo que dé XP pasa por el servidor.** La función `complete_workout()` ya tiene topes anti-abuso (1500 XP por sesión, 3000 por día). Las sesiones de running deben entrar por ahí, no por una vía paralela.
- **Una sola tabla de sesiones.** Separar `run_sessions` de `workout_sessions` obligaría a unir las dos en cada consulta de calendario, historial, racha y XP **[estimado: el coste de mantener dos caminos supera el de unas columnas nulas]**. Se discrimina con `activity_type`.
- **RLS en todo lo nuevo**, con el mismo patrón `auth.uid() = user_id` que ya usan las tablas existentes.

---

## A. Tipo de actividad — la columna que lo desbloquea todo

```sql
-- PROPUESTA, no ejecutar
ALTER TABLE public.workout_sessions
  ADD COLUMN IF NOT EXISTS activity_type TEXT NOT NULL DEFAULT 'strength'
  CHECK (activity_type IN ('strength', 'run', 'ride', 'swim', 'other'));
```

El `DEFAULT 'strength'` hace que las filas existentes sigan siendo válidas sin migración de datos.

---

## B. Métricas de cardio en `workout_sessions`

Columnas nuevas, todas nulas para las sesiones de fuerza:

| Columna | Tipo | Para qué |
|---|---|---|
| `distance_m` | `INTEGER` | Distancia en metros. Entero: evita errores de coma flotante al sumar |
| `moving_time_s` | `INTEGER` | Tiempo en movimiento, en segundos |
| `elapsed_time_s` | `INTEGER` | Tiempo total, en segundos |
| `elevation_gain_m` | `INTEGER` | Desnivel positivo |
| `avg_hr` / `max_hr` | `SMALLINT` | Frecuencia cardíaca, si la hay |
| `perceived_effort` | `SMALLINT` | Esfuerzo percibido 1-10, el equivalente del RPE para carrera |
| `run_type` | `TEXT` | `easy`, `long`, `intervals`, `tempo`, `recovery`, `race` |
| `splits` | `JSONB` | Parciales por kilómetro o por intervalo |

El **ritmo no se guarda**: se calcula (`moving_time_s / distance_m`). Guardar un dato derivado es garantizarse que algún día no cuadre con sus fuentes **[estimado, pero es la razón habitual].**

```sql
-- PROPUESTA
ALTER TABLE public.workout_sessions
  ADD COLUMN IF NOT EXISTS distance_m       INTEGER,
  ADD COLUMN IF NOT EXISTS moving_time_s    INTEGER,
  ADD COLUMN IF NOT EXISTS elapsed_time_s   INTEGER,
  ADD COLUMN IF NOT EXISTS elevation_gain_m INTEGER,
  ADD COLUMN IF NOT EXISTS avg_hr           SMALLINT,
  ADD COLUMN IF NOT EXISTS max_hr           SMALLINT,
  ADD COLUMN IF NOT EXISTS perceived_effort SMALLINT CHECK (perceived_effort BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS run_type         TEXT CHECK (run_type IN ('easy','long','intervals','tempo','recovery','race')),
  ADD COLUMN IF NOT EXISTS splits           JSONB;
```

---

## C. `scheduled_sessions` — el calendario con fechas reales

Tabla nueva. Es la pieza central del calendario unificado: una fila por **sesión planificada en una fecha concreta**.

Escrita: `supabase/migrations/20260925000000_scheduled_sessions_and_plans.sql` (Fase 4), junto con §D y las políticas de §G. Lo que se ejecutó se aparta de este borrador en tres puntos, marcados abajo.

```sql
-- APLICADO (con las desviaciones de abajo)
CREATE TABLE IF NOT EXISTS public.scheduled_sessions (
  id            TEXT PRIMARY KEY,  -- desviación 1
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id       UUID REFERENCES public.training_plans(id) ON DELETE SET NULL,
  scheduled_for DATE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('strength','run','ride','swim','other','rest')),
  template_id   UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  run_spec      JSONB,
  title         TEXT,
  status        TEXT NOT NULL DEFAULT 'planned'
                CHECK (status IN ('planned','completed','skipped','moved')),
  session_id    UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  sort_order    SMALLINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_user_date
  ON public.scheduled_sessions(user_id, scheduled_for);
```

Decisiones que merecen justificación:

- **`scheduled_for` es `DATE`, no `TIMESTAMPTZ`.** "El entreno del martes" es un día del calendario del usuario, no un instante. Con `TIMESTAMPTZ` el entreno cambia de día al viajar de zona horaria.
- **`session_id` enlaza plan y realidad.** Al completar una sesión planificada se crea la fila en `workout_sessions` y se apunta aquí. Permite responder "¿cumplí el plan?" sin heurísticas de fecha.
- **`run_spec` es JSONB** porque la estructura de una sesión de series (`10 min calentamiento + 6x800m + 10 min vuelta a la calma`) no cabe en columnas fijas sin inventar una tabla de bloques **[estimado: JSONB es suficiente hasta que haya editor visual de intervalos]**.
- **`sort_order`** permite dos sesiones el mismo día (carrera por la mañana, pesas por la tarde) con orden explícito.
- **`status = 'moved'`** distingue "lo moví" de "me lo salté", que para la racha y para la gamificación no son lo mismo.
- **`activity_type` incluye `rest`** para poder planificar descanso explícito, que ya tiene XP asignado (`XP.REST_DAY = 5`).

Desviaciones de la migración aplicada respecto a este borrador:

1. **`id` es `TEXT`, no `UUID`.** La proyección de `weekly_schedule` a fechas usa claves deterministas (`wk-2026-09-21`, una por día) para ser idempotente: reproyectar la misma semana reescribe la misma fila. Con `UUID` generado en servidor, cada recarga crearía un plan duplicado. Las sesiones añadidas a mano usan `man-<fecha>-<timestamp>`.
2. **`template_id` y `session_id` son `TEXT` sin clave ajena.** El cliente crea plantillas y sesiones en local antes de subirlas, y esos ids no son UUID (`tpl_upper_power`). Una FK a `templates(id) UUID` rechazaría la fila entera y el calendario dejaría de guardarse. La integridad la da el `ON DELETE CASCADE` de `user_id`.
3. **`activity_type` admite también `mobility`**, que es uno de los cuatro tipos que pinta el calendario.

`profiles.weekly_schedule` **se mantiene** como plantilla recurrente: es la que genera filas de `scheduled_sessions` hacia delante. No se borra, cambia de papel.

---

## D. `training_plans` — plan con objetivo y fecha

Escrita en la misma migración que §C. Sin cambios respecto a este borrador; todavía no la usa ningún código del cliente (`scheduled_sessions.plan_id` queda a `NULL`).

```sql
-- APLICADO
CREATE TABLE IF NOT EXISTS public.training_plans (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  goal_type   TEXT NOT NULL CHECK (goal_type IN ('strength','hypertrophy','fat_loss','endurance','race')),
  race_distance TEXT CHECK (race_distance IN ('5k','10k','half','marathon','other')),
  race_date   DATE,
  starts_on   DATE NOT NULL,
  ends_on     DATE,
  weeks       SMALLINT,
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active','completed','abandoned')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Esto es lo que permite "quiero correr un 10k en 12 semanas" y que el plan genere las `scheduled_sessions` correspondientes. `race_date` y `race_distance` son nulos en planes de gimnasio puro.

---

## E. Gamificación al servidor

Escrita: `supabase/migrations/20260927000000_weekly_gamification.sql` (Fase 6) — `earned_badges` y `weekly_challenges`, más el recálculo de la racha de diaria a semanal en `complete_workout()`. Los congeladores de racha (`streak_freezes`) y la periodización **siguen sin migrar**: la Fase 6 no los pedía y `streak_freezes` sigue operando sobre la racha (ahora semanal) igual que antes, en `localStorage`.

```sql
-- APLICADO (con las desviaciones de abajo)
CREATE TABLE IF NOT EXISTS public.earned_badges (
  user_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id  TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('workouts','pr','volume','sets')),
  target     INTEGER NOT NULL,
  progress   INTEGER NOT NULL DEFAULT 0,
  bonus_xp   INTEGER NOT NULL DEFAULT 0,
  completed  BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, week_start)  -- desviación 1
);
```

Pendiente, sin migrar (`streak_freezes`/`periodization`):

```sql
-- PROPUESTA, sigue sin aplicar
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_freezes       SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_freezes_month TEXT,
  ADD COLUMN IF NOT EXISTS periodization        JSONB;
```

La clave primaria compuesta de `earned_badges` hace **imposible** duplicar un badge, que es exactamente la garantía que `localStorage` no puede dar. La escritura de ambas tablas está bloqueada para el cliente (solo `SELECT`, sin `GRANT INSERT/UPDATE`): pasa siempre por `award_badge()` o `claim_weekly_challenge_bonus()`, que revalidan la condición contra `workout_sessions`/`personal_records`/`profiles` antes de escribir. El cliente sigue calculando localmente qué cree haber ganado (para el toast al instante), pero eso ya no es lo que decide qué queda registrado.

Desviaciones de la migración aplicada respecto a este borrador:

1. **`UNIQUE (user_id, week_start)`, sin `type`.** El reto de la semana es una rotación determinista de 6 plantillas (`lib/challenges.ts`, igual para todos los usuarios esa semana). Con `UNIQUE (user_id, week_start, type)` nada impediría reclamar los 6 bonos de golpe la misma semana con una sesión que cumpla varios objetivos a la vez (150+150+150+120+100+200 XP en vez del ~100-200 previsto). Con la clave sin `type`, la primera reclamación válida de la semana fija el tipo; una reclamación de otro tipo esa misma semana se rechaza.
2. **`type` no incluye `distance`/`run_sessions`.** No hacía falta: `'workouts'` ya cuenta cualquier `workout_sessions.status = 'completed'`, carrera incluida (no discrimina por `activity_type`). Añadir tipos nuevos sin ningún reto que los use habría sido una CHECK para una feature que no existe todavía.
3. **La racha del reto (`bonus_xp`) no pasa por los topes de `complete_workout()`** (1500/sesión, 3000/día): es un canal aparte, ya limitado a como mucho un pago por semana por el `UNIQUE`.

---

## F. Strava

Escrita: `supabase/migrations/20260928000000_strava_integration.sql` (Fase 7). Decisión de seguridad resuelta (confirmado 27-09-2026): **RLS de solo-servicio**, no Vault — ver desviaciones abajo.

```sql
-- APLICADO (con las desviaciones de abajo)
CREATE TABLE IF NOT EXISTS public.strava_connections (
  user_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  athlete_id        BIGINT NOT NULL,
  access_token      TEXT NOT NULL,
  refresh_token     TEXT NOT NULL,
  expires_at        TIMESTAMPTZ NOT NULL,
  scope             TEXT,
  connected_at      TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at    TIMESTAMPTZ
);

ALTER TABLE public.workout_sessions
  ADD COLUMN IF NOT EXISTS source           TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual','strava','import')),
  ADD COLUMN IF NOT EXISTS external_id      TEXT,
  ADD COLUMN IF NOT EXISTS external_source  TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_external
  ON public.workout_sessions(user_id, external_source, external_id)
  WHERE external_id IS NOT NULL;
```

El índice único parcial es la **defensa contra duplicados**: Strava reenvía eventos y el usuario puede editar una actividad, así que la misma carrera puede llegar dos veces. Sin esa restricción, el XP se pagaría dos veces.

**Desviación no prevista aquí:** el XP de una actividad importada no lo paga `complete_workout()` (exige `auth.uid()`, y el webhook no tiene sesión de usuario — corre como `service_role`). Se añadió `award_imported_activity_xp(p_user_id, p_session_id)`, misma fórmula y mismos topes que la rama de cardio de `complete_workout()`, pero recibiendo el usuario como parámetro en vez de leerlo del JWT. Solo la llama `service_role`.

**Nota de seguridad — resuelta (27-09-2026): opción (a), RLS de solo-servicio.** Se descartó Vault por añadir una pieza de infraestructura nueva solo para proteger dos columnas que (a) ya deja inalcanzables. Implementación real, algo más precisa que "RLS abierta o cerrada": la policy de `SELECT` con `auth.uid() = user_id` **sí existe** (el cliente necesita saber que está conectado), pero el `GRANT SELECT` que la acompaña es **por columnas** — `user_id, athlete_id, connected_at, last_synced_at` únicamente. `access_token`/`refresh_token`/`expires_at`/`scope` no tienen `GRANT` para `authenticated` en absoluto, así que ni con la fila propia autorizada por RLS puede el cliente leerlas: un `SELECT access_token` falla por permisos antes de llegar a RLS. Solo la Edge Function, con `service_role` (que no pasa por `GRANT` ni por RLS), los toca. `DELETE` sí está permitido para el propio usuario (desconectar), porque borrar la fila entera no expone el contenido de ninguna columna.

---

## G. RLS para todo lo nuevo

Mismo patrón que las tablas existentes, para las cuatro tablas nuevas de usuario:

```sql
-- PROPUESTA (repetir por tabla)
ALTER TABLE public.scheduled_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own scheduled sessions select" ON public.scheduled_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own scheduled sessions insert" ON public.scheduled_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own scheduled sessions update" ON public.scheduled_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own scheduled sessions delete" ON public.scheduled_sessions
  FOR DELETE USING (auth.uid() = user_id);
```

**Excepción:** `strava_connections` no debe tener política de `SELECT` para el cliente (ver §F).

---

## H. Cambio en `complete_workout()`

La función actual calcula XP con `v_completed_sets * 5 + v_rpe_sets * 10 + v_prs * 25`, que da **0 XP a una carrera** porque no tiene series. Hay que añadir una rama por `activity_type`:

- `strength`: la fórmula actual, sin tocar.
- `run` / `ride` / `swim`: XP por duración o distancia, con el mismo multiplicador de racha y el mismo bonus de mañana, y **respetando los mismos topes** (1500 por sesión, 3000 diarios).
- Marcar `scheduled_sessions.status = 'completed'` y rellenar `session_id` si la sesión venía de una fila planificada.

La fórmula concreta de XP para carrera es una **decisión de producto pendiente**: XP por kilómetro premia al que corre lejos, XP por minuto premia al que corre despacio, XP por esfuerzo percibido es justo pero falseable. Mi recomendación **[estimado]**: XP por minuto en movimiento, con un modificador por `run_type`, porque es la que peor se puede manipular sin correr de verdad.

---

## I. `profiles` — disciplina y lesiones del onboarding (Fase 3)

Escrita: `supabase/migrations/20260924000000_add_onboarding_profile_fields.sql`. Es la única
de este documento que existe como migración; el resto sigue siendo propuesta.

| Columna | Tipo | Para qué |
|---|---|---|
| `discipline` | `TEXT CHECK ('gym','running','both')` | Decide si el onboarding genera plan de gimnasio, de carrera o mixto. `NULL` en los perfiles anteriores; el cliente los lee como `gym` |
| `injuries` | `TEXT[] DEFAULT '{}'`, máx. 20 | Zonas con molestias marcadas en el onboarding. Se muestran junto al plan; **no filtran la selección de ejercicios** (no existe mapa de contraindicaciones) |
| `limitations` | `TEXT`, máx. 500 | Nota libre del usuario |

Decisiones:

- **`injuries` es `TEXT[]`, no tabla.** Son 7 zonas de una lista cerrada que solo se leen enteras y solo las lee su dueño. Una tabla `user_injuries` añadiría RLS, JOIN y migración a cambio de nada **[estimado: hasta que una lesión tenga fechas de inicio/fin o severidad]**.
- **`injuries` y `limitations` son datos de salud** (art. 9 RGPD), como `health_consent_at`. Los cubre la RLS que ya tiene `profiles` (`auth.uid() = id`) y los borra `delete_user_account()` con el resto del perfil. No hay tratamiento nuevo: se guardan para mostrárselos al propio usuario.
- **Los topes (`cardinality <= 20`, `char_length <= 500`) van en la base**, no solo en el `<textarea>`: la API de Supabase es la frontera real, el formulario no.
- **Hay que dar `GRANT UPDATE` de las tres columnas.** `20260918000000` quitó el `GRANT UPDATE` de tabla y lo pasó a lista blanca por columna: una columna nueva nace no escribible y el fallo es silencioso (el `UPDATE` se rechaza, el cliente guarda en `localStorage` y sigue).
- **Aplicarla no es urgente.** Sin ella el cliente funciona: los tres campos viven en `localStorage` y solo se pierden al cambiar de dispositivo.

---

## Resumen de cambios

| Qué | Tipo |
|---|---|
| `workout_sessions` + activity_type y 5 de cardio (manual: distance/moving_time/elapsed_time/perceived_effort/run_type) | ALTER — **APLICADA** (`20260926000000`) |
| `workout_sessions` + source/external_id/external_source | ALTER — **APLICADA** (`20260928000000`) |
| `workout_sessions` + resto de §B (avg_hr, max_hr, elevation_gain_m, splits) | ALTER — sin aplicar (sensores; ninguna fase lo pide todavía) |
| `profiles` + 3 columnas (streak_freezes, streak_freezes_month, periodization) | ALTER — sin aplicar |
| `profiles` + 3 columnas (discipline, injuries, limitations) | ALTER — **APLICADA** (`20260924000000`) |
| `scheduled_sessions` | TABLA NUEVA — **APLICADA** (`20260925000000`) |
| `training_plans` | TABLA NUEVA — **APLICADA** (`20260925000000`) |
| `earned_badges` | TABLA NUEVA — **APLICADA** (`20260927000000`) |
| `weekly_challenges` | TABLA NUEVA — **APLICADA** (`20260927000000`) |
| `strava_connections` | TABLA NUEVA — **APLICADA** (`20260928000000`) |
| `complete_workout()` con rama de cardio | FUNCIÓN MODIFICADA — **APLICADA** (`20260926000000`) |
| `complete_workout()` con racha semanal | FUNCIÓN MODIFICADA — **APLICADA** (`20260927000000`) |
| `award_badge()` / `claim_weekly_challenge_bonus()` | FUNCIONES NUEVAS — **APLICADAS** (`20260927000000`) |
| `award_imported_activity_xp()` | FUNCIÓN NUEVA — **APLICADA** (`20260928000000`) |
| Índice único parcial anti-duplicados de Strava | ÍNDICE NUEVO — **APLICADO** (`20260928000000`) |

De esto hay **seis migraciones aplicadas**: `20260918000000` (XP al servidor), `20260924000000` (apartado I), `20260925000000` (apartados C, D y la parte de G que les toca), `20260926000000` (apartados A, la parte de B del registro manual, y H), `20260927000000` (apartado E, con la racha semanal) y `20260928000000` (apartado F, Strava). Lo que queda **sin ejecutar** es el resto de §B — métricas de sensor (frecuencia cardíaca, desnivel, splits) que ninguna fase construida hasta ahora consume.
