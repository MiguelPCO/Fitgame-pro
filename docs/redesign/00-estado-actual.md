# 00 — Estado actual de FitGame Pro

> Extraído del código en `main` (árbol con cambios sin commitear). Todo lo de este documento sale de archivos del repo; las rutas se citan en cada punto. Lo que es juicio mío va marcado **[estimado]**.

---

## 1. Stack y arquitectura

| Capa | Tecnología | Fuente |
|---|---|---|
| UI | React 19.2 + TypeScript strict + Vite 6 | `package.json` |
| Estilos | Tailwind CSS **v3.4** (PostCSS) | `package.json` |
| Estado | Context API (`AppContext`) + localStorage-first | `context/AppContext.tsx` (848 líneas) |
| Backend | Supabase v2.94 (auth + Postgres + RLS) | `lib/supabase.ts` |
| Iconos | Lucide React | `components/Layout.tsx` |
| Gráficos | Recharts | `CLAUDE.md:44-57` |
| PWA | vite-plugin-pwa (workbox generateSW) | `CLAUDE.md:132` |
| Deploy | Vercel, SPA rewrites | `vercel.json` |

Estado declarado: **production-ready**, 0 errores TS, 138 tests unitarios, 36 E2E, 256 kB de JS en arranque (`CLAUDE.md:11-17`).

**Punto clave de arquitectura:** `lib/supabase.ts` expone `getSupabase()` async para que el bundle de Supabase (174 kB) no entre en el arranque. Todos los servicios hacen `await getSupabase()`.

---

## 2. Pantallas actuales (16 páginas)

De `pages/` y del `switch` de `App.tsx:143-190`:

| Ruta (`ROUTES`) | Archivo | Qué hace | Líneas |
|---|---|---|---|
| `dashboard` | `pages/Dashboard.tsx` | Home: entreno de hoy, XP, racha, checklist | 688 |
| `workout` | `pages/WorkoutPlayer.tsx` | Sesión activa, **fullscreen fuera del Layout** | 553 |
| `summary` | `pages/WorkoutSummary.tsx` | Resumen post-sesión, XP desglosado, PRs | 195 |
| `templates` | `pages/Templates.tsx` | Lista de plantillas | 137 |
| `template-editor` | `pages/TemplateEditor.tsx` | Editor, también fuera del Layout | 273 |
| `schedule` | `pages/Schedule.tsx` | Programa semanal (asignar plantilla a día) | 205 |
| `programs` | `pages/Programs.tsx` | Programas preconfigurados | 344 |
| `challenges` | `pages/Challenges.tsx` | Retos semanales + retos sociales por código | 559 |
| `exercises` | `pages/ExerciseLibrary.tsx` | Biblioteca de ejercicios | 401 |
| `progress` | `pages/Progress.tsx` | Gráficas, PRs, volumen | 693 |
| `history` | `pages/History.tsx` | Historial de sesiones | 377 |
| `settings` | `pages/Settings.tsx` | Ajustes, tema, export CSV, borrar cuenta | 560 |
| `onboarding` | `pages/Onboarding.tsx` | 7 pasos | 440 |
| — | `pages/Login.tsx` / `Signup.tsx` | Auth (no lazy: preceden al gate) | 215 / 216 |
| — | `pages/Legal.tsx` | `/privacidad` y `/aviso-legal`, públicas por URL | 136 |

Inventario de componentes: `components/ui/` (Badge, Button, Card, Input, Modal, Skeleton, Slider, Toast), `components/session/` (ExerciseCard, ExerciseSidebar, PRBadge, RPESlider, RestTimer, SessionHeader, SessionStats, SessionSummary, SetCard, SetInputModal, XPBreakdown), `components/home/` (PeriodizationCard, WelcomeChecklist, WorkoutDayCard), `components/progress/` (LevelBadge, XPBar), `components/workout/` (AddExerciseModal).

---

## 3. Navegación

**Routing por estado, no por URL** (`CLAUDE.md:116-118`). `App.tsx:81` guarda `currentView` en `useState`; `navigate()` (`App.tsx:110-114`) cambia el estado y hace `window.scrollTo(0,0)`. Las únicas rutas reales por URL son las legales (`App.tsx:238-246`).

El shell es `components/Layout.tsx`: **sidebar de 256px** (`w-64`) fija en desktop que en móvil colapsa a drawer deslizante (`-translate-x-full` / `translate-x-0`), más un header sticky de 64px con breadcrumb, `SyncIndicator`, nombre, nivel y avatar.

Los 10 ítems de navegación (`components/Layout.tsx:36-47`): Inicio, Plantillas, Programa, Programas, Retos, Entrenamiento, Ejercicios, Progreso, Historial, Configuración.

Dos páginas rompen el shell a propósito: `workout` y `template-editor` se renderizan sin Layout (`App.tsx:193-215`).

---

## 4. Modelo de datos

### TypeScript (`types/index.ts`)

- **`UserProfile`** — `level`, `xp`, `xpToNextLevel`, `streak`, `tier` (Novice / Intermediate / Advanced / Elite), más preferencias de onboarding (`goal`, `daysPerWeek`, `minutesPerSession`, `equipment[]`, `experienceLevel`, `limitations`), `weeklySchedule`, `onboardingCompleted`.
- **`WeeklySchedule`** — `Partial<Record<0..6, string>>`: día de la semana a **id de plantilla**. Nada más: sin fecha, sin instancia, sin estado por día.
- **`WorkoutSession`** — `exercises: ActiveExercise[]`, `status` (pending / active / completed / skipped), `xpReward`, `startTime`, `endTime`, `notes`.
- **`WorkoutSet`** — `type` (warmup / top / backoff), `weight`, `reps`, `rpe?`, `completed`, `targetReps`, `targetRPE`, más `recommendedWeight`, `isFailed`, `isPain`, `notes`.
- **`PeriodizationState`** — `currentPhase` 1-3, `phaseStartDate`, `completedTrainingWeeks`.
- **`OverloadSuggestion`** — sugerencia de subir peso o reps por ejercicio.

### Supabase (`supabase/schema.sql` + 7 migraciones)

| Tabla | Columnas relevantes |
|---|---|
| `profiles` | `level`, `xp`, `xp_to_next_level`, `streak`, `tier`, `goal`, `days_per_week`, `minutes_per_session`, `equipment[]`, `experience_level`, `weekly_schedule` (JSONB), `onboarding_completed`, `health_consent_at` |
| `templates` | `exercises` JSONB, `muscle_focus[]`, `duration` TEXT, `difficulty`, `last_performed` |
| `workout_sessions` | `exercises` JSONB, `status`, `xp_reward`, `start_time`, `end_time`, `notes`, `xp_awarded_at` |
| `personal_records` | `exercise_id`, `weight`, `reps`, `achieved_at`, `UNIQUE(user_id, exercise_id)` |
| `social_challenges` | `code` único, `type` (workouts / volume / streak), `target`, `bonus_xp`, `starts_at`, `ends_at` |
| `challenge_participants` | `challenge_id`, `user_id`, `progress` |

RLS activo en todas las tablas, políticas por `auth.uid()`. La migración `20260918000000_server_side_progress.sql` movió el cálculo de XP al servidor con la función `complete_workout(p_session_id, p_tz)`, con techos anti-abuso: máximo 1500 XP por sesión y 3000 XP por día.

**Observación importante para el rediseño:** no existe ninguna tabla ni columna para **running, cardio o sesiones no-gimnasio**. `workout_sessions.exercises` es JSONB de series de fuerza. Tampoco hay entidad de **plan con fechas** ni de **sesión programada en una fecha concreta**: el calendario es un mapa día-de-semana a plantilla, recurrente e infinito.

---

## 5. Gamificación existente

### XP (`services/xp.ts`, `lib/constants.ts:22-30`)

```
PER_SET               = 5
BONUS_RPE_9_PLUS      = 10
BONUS_PR              = 25
BONUS_FULL_COMPLETION = 30
REST_DAY              = 5
multiplicador racha   = +2% por día, tope +50%   (STREAK_BONUS_PER_DAY / MAX_STREAK_BONUS)
bonus mañana          = +20% si entrena 6-10am   (MORNING_BONUS)
nivel siguiente       = xpToNextLevel * 1.2      (LEVEL_MULTIPLIER)
```

`XPBreakdown` (`services/xp.ts:79-90`) devuelve el desglose completo para poder mostrarlo en el resumen — ya está resuelto, es un activo a conservar.

### Rachas

`computeNewStreak()` y `getValidatedStreak()` (`services/xp.ts:9-48`): mismo día no suma, día consecutivo incrementa, 2+ días resetea. La validación en carga corrige rachas obsoletas. Existe además `StreakFreezeState` (`types/index.ts`): congeladores de racha con reseteo mensual.

### Badges (`lib/badges.ts`)

**20 badges** en 5 categorías: `milestone` (8), `streak` (3), `strength` (3), `consistency` (3), `volume` (2). Nombres en español ("Primer Paso", "Semana de Fuego", "Centurión").

### Retos

- **Semanales** (`WeeklyChallenge` en `types/index.ts`): tipos workouts / pr / volume / sets, con `target`, `progress`, `bonusXP`.
- **Sociales** (`services/socialChallenges.ts` + tablas): reto por código compartible, tipos workouts / volume / streak, con tabla de participantes y progreso.

### Niveles y tiers

Escalera de 5 tramos con gradiente propio por rango de nivel (`DESIGN.md:56-64`): 1-9 Novice, 10-19 Regular, 20-29 Intermediate, 30-49 Advanced, 50+ Elite.

### Periodización

`lib/periodization.ts` + `components/home/PeriodizationCard.tsx`: 3 fases, avanza contando semanas con al menos una sesión completada.

---

## 6. Sistema de diseño actual

`DESIGN.md` documenta lo que ya está en producción:

- **Canvas oscuro** `#0f172a`, cards `#1e293b`, elevado `#334155`. Fondo obligatorio en gradiente radial, nunca plano.
- **Un solo acento cromático**: rojo señal `#DC2626`, hover `#B91C1C`, con glow a juego. Solo para CTA, nav activa, cifras de XP, barras de progreso.
- **Colores semánticos** aparte: verde (completado), ámbar (celebración/PR), azul (programado), morado (tier avanzado).
- **Tipografía**: Inter exclusivamente, pesos 400-900. `font-black` en cifras y títulos; badges siempre en mayúsculas con `tracking-wider`.
- **Radios**: 8/12/16/24 px. Nada de esquinas rectas, nada de botones píldora.
- **Sombras**: glow del color del propio elemento; en modo claro, sombra plana.
- **Motion**: keyframes propios (`xp-fly`, `check-pop`, `scale-in`, shimmer de la barra de XP), con `prefers-reduced-motion` ya respetado globalmente.

**Tema claro**: existe (estrategia `class`, `.dark` / `.light` en `<html>`, hook `hooks/useTheme.ts`) y `DESIGN.md` da los hex de ambos modos. Está construido, pero es claramente el modo secundario **[estimado: casi todas las decisiones de color del DESIGN.md están razonadas solo para oscuro]**.

---

## 7. Puntos débiles en móvil

Ordenados por impacto. Cada uno con la evidencia en código.

### 7.1 No hay navegación inferior — crítico
La navegación móvil es un **drawer lateral con 10 ítems** (`components/Layout.tsx:71-116`). Ninguna app de fitness moderna navega así en móvil: obliga a dos toques (abrir menú, elegir) para cualquier cambio de sección, y el menú tapa la pantalla. El propio `CLAUDE.md:5-9` declara la app como "móvil-first", pero el shell es de escritorio.

### 7.2 Diez destinos de primer nivel — crítico
Diez ítems de nav son demasiados para móvil; además hay solapamiento conceptual evidente: **Plantillas / Programa / Programas** son tres entradas distintas para "qué voy a entrenar", y **Progreso / Historial** son dos para "qué he hecho". Esto es un problema de arquitectura de información, no de estilo.

### 7.3 Sin URLs, sin botón atrás — alto
Routing por estado (`App.tsx:81`, `CLAUDE.md:116`). Consecuencias reales en una PWA instalada: el botón atrás de Android sale de la app en vez de retroceder de pantalla, no se puede compartir un enlace a una sección, no hay deep link desde una notificación, y al recargar siempre se vuelve al dashboard. Para una PWA esto además complica cualquier integración que devuelva al usuario con un callback (por ejemplo el OAuth de Strava).

### 7.4 El header gasta 64px sin dar nada en móvil — medio
`components/Layout.tsx:122-160`: el breadcrumb es `hidden md:flex`, el `SyncIndicator` es `hidden md:block`, el bloque nombre+nivel es `hidden sm:block`. En un móvil pequeño quedan el botón de menú y el avatar ocupando una franja de 64px.

### 7.5 El calendario no es un calendario — alto
`pages/Schedule.tsx` es una lista de 7 días con un desplegable por día para asignar plantilla. No hay vista de mes, ni fechas reales, ni estado por día (hecho / saltado / pendiente), ni reprogramar arrastrando, ni sesión puntual fuera del patrón semanal. El modelo de datos lo impide: `WeeklySchedule` es día-de-semana a id de plantilla, sin fecha.

### 7.6 Cero soporte de running/cardio — alto (bloquea el objetivo del rediseño)
No hay tipos, tablas ni UI para sesiones de carrera: ni distancia, ni ritmo, ni duración como métrica, ni tipos de sesión (rodaje, series, tempo, tirada larga). `WorkoutSet` es peso por reps por RPE. Todo el módulo de running es construcción nueva.

### 7.7 Registro de series en modal — medio
`components/session/SetInputModal.tsx` abre un modal por serie (`pages/WorkoutPlayer.tsx:25,54`). Las apps de gym de referencia registran en línea, en la propia fila, sin cambiar de contexto. Un modal por serie son dos toques extra por cada una de las ~20 series de una sesión **[estimado: pendiente de contrastar con el benchmark de `02-benchmark.md`]**.

### 7.8 El onboarding pide todo por adelantado — medio
7 pasos antes de ver nada de la app (`pages/Onboarding.tsx:18`): objetivo, disponibilidad, equipamiento, experiencia, plan generado, programa semanal, listo. Es razonable en contenido, pero no hay salida, no se puede posponer y no muestra valor hasta el paso 5.

### 7.9 Sin gestos
No hay swipe entre ejercicios, ni pull-to-refresh, ni bottom sheets nativos (los modales son centrados, `components/ui/Modal.tsx`). El motion existe (`slide-up` de 300 ms ya definido en el tema) pero no se usa como patrón de navegación.

### 7.10 Modo claro a medias
Existe la infraestructura, pero el `DESIGN.md` razona los efectos solo para oscuro ("glow effects are dark-mode only") y no hay tokens de contraste verificados para claro. Sin auditar **[estimado]**.

---

## 8. Activos a conservar en el rediseño

No todo hay que rehacerlo. Esto ya está bien resuelto y debe sobrevivir:

1. **`XPBreakdown` con desglose completo** — la transparencia de por qué ganas XP es buen diseño de gamificación.
2. **XP calculado en servidor con topes** (`complete_workout`) — anti-trampa ya resuelto; cualquier tipo de sesión nuevo debe pasar por ahí.
3. **Offline-first con cola de operaciones** (`services/offlineQueue.ts`) — imprescindible en un gimnasio sin cobertura.
4. **Validación de racha en carga** — evita rachas fantasma.
5. **`prefers-reduced-motion` global** y objetivos táctiles de 44px ya como convención.
6. **Carga diferida de Supabase** y code splitting por página.
7. **Las 20 badges y su taxonomía de 5 categorías** — la estructura sirve, solo hay que ampliarla a running.
