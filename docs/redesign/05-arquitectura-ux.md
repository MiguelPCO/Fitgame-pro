# 05 — Arquitectura UX móvil

> Se apoya en `00-estado-actual.md` (qué hay), `02-benchmark.md` (qué hace el sector) y `01-referencias-video.md` (qué se ve en las grabaciones). Lo marcado **[estimado]** es criterio de diseño, no dato verificado.

---

## 1. La decisión de partida: esto es una app de plan

`02-benchmark.md` §2.1 establece que hay **dos arquetipos de navegación incompatibles**: las apps de plan anclan en un "Hoy" que responde *¿qué toca?*; las de tracking anclan en el feed o en el botón de grabar. FitGame Pro promete *"Onboarding → Plan personalizado → Ejecutar sesiones → Ganar XP"* (`CLAUDE.md:5-9`).

**Es una app de plan.** Todo lo que sigue se deriva de ahí: la pantalla ancla es Hoy, el calendario es ciudadano de primer nivel, y no hay feed social.

---

## 2. De 10 destinos a 5

| Hoy (10 ítems del drawer) | Pasa a ser |
|---|---|
| Inicio | **Hoy** |
| Plantillas · Programa · Programas | **Plan** (las tres eran la misma pregunta: "¿qué voy a entrenar?") |
| Entrenamiento | **Botón central de acción** |
| Progreso · Historial | **Progreso** (las dos eran "¿qué he hecho?") |
| Retos · Ejercicios · Configuración | **Perfil** |

### Barra inferior: 5 destinos

```
┌──────┬──────┬────────┬────────┬────────┐
│ Hoy  │ Plan │   ➕   │Progreso│ Perfil │
└──────┴──────┴────────┴────────┴────────┘
```

- **Hoy** — qué toca hoy, racha, XP. Es el destino por defecto al abrir.
- **Plan** — calendario unificado (semana y mes) + rutinas.
- **➕** — no es una pestaña, es una acción: abre un sheet con *Empezar entreno libre* / *Registrar carrera* / *Añadir sesión al plan*.
- **Progreso** — gráficas, récords, historial. Fusiona las dos pantallas actuales.
- **Perfil** — nivel, logros, retos, biblioteca de ejercicios, ajustes.

Justificación del ➕ central: `02-benchmark.md` §2.2 constata que ninguna app pasa de 5 destinos, y el registro fuera de plan tiene que estar a un toque desde cualquier pantalla. Ponerlo como botón y no como pestaña evita gastar un destino en algo que no es un lugar **[estimado]**.

---

## 3. Mapa de pantallas

```
Hoy ─────────────── Sesión de fuerza ──── Resumen de sesión
 │                   Sesión de carrera ───┘
 ├── Detalle de sesión planificada
 └── Racha / XP (sheet)

Plan ────────────── Calendario: semana ⇄ mes
 ├── Detalle de día (sheet)
 ├── Rutinas ──── Editor de rutina
 └── Crear plan ── Objetivo → fecha → días → generar

➕ (sheet) ──────── Entreno libre → Sesión de fuerza
 ├── Registrar carrera → Formulario manual
 └── Añadir al plan → Calendario

Progreso ────────── Fuerza | Carrera (dos pestañas)
 ├── Detalle de ejercicio (gráfica 1RM)
 ├── Récords
 └── Historial ──── Detalle de sesión pasada

Perfil ──────────── Nivel y logros
 ├── Retos (semanales + sociales)
 ├── Biblioteca de ejercicios
 ├── Conectar Strava
 └── Ajustes ──── Tema · unidades · notificaciones · exportar · cuenta
```

**Todas las pantallas necesitan URL real.** El routing por estado actual (`00-estado-actual.md` §7.3) rompe el botón atrás de Android, impide los deep links desde notificación y **bloquea el callback OAuth de Strava** (`03-integraciones.md` §5).

---

## 4. Flujos clave

### 4.1 Onboarding

`02-benchmark.md` §3.14 y §2.8: el problema de los 7 pasos actuales no es la longitud —Freeletics tiene 25— sino que **no hay recompensa visible antes del final** y no hay indicador de progreso.

Cambios, manteniendo los 7 pasos:

1. **Indicador de progreso visible** desde el paso 1 (ya existe "Paso X de 7" en `pages/Onboarding.tsx:112`; lo que falta es que se vea como barra, no como texto).
2. **Nuevo paso 0: disciplina.** ¿Gimnasio, carrera o ambos? Determina todo lo demás, y hoy no se pregunta porque la app asumía gimnasio.
3. **Pregunta por lesiones de forma explícita.** El campo `limitations` ya existe en `UserProfile` y **ninguna app del benchmark lo hace** (`02-benchmark.md` §3.19). Es diferenciación gratuita.
4. **Micro-reacción tras cada respuesta**, como hace RunnerPro (`01-referencias-video.md`, frame `v4/sec_010.jpg`): una línea bajo la opción elegida que reacciona a lo que acabas de decir. Convierte el formulario en conversación por muy poco coste.
5. **El plan generado se enseña antes de pedir nada más.** Ya ocurre en el paso 5; hay que darle el peso de un momento, no de un paso intermedio.

### 4.2 Calendario unificado

Es la pieza central del rediseño. Dos vistas sobre los mismos datos (`scheduled_sessions`, `06-modelo-datos.md` §C).

**Vista semana** (por defecto): tira de 7 días arriba, agenda del día seleccionado debajo. Es la vista operativa.

**Vista mes**: cuadrícula con hasta 2 puntos de color por día. Es la vista de contexto — ver la carga del mes, encontrar un hueco, comprobar la racha.

**Color por tipo de entreno** (tokens de `04-design-system.md` §3):

| Tipo | Oscuro | Claro |
|---|---|---|
| Fuerza | `#FB923C` | `#C2410C` |
| Carrera | `#22D3EE` | `#0E7490` |
| Movilidad | `#A78BFA` | `#6D28D9` |
| Descanso | `#94A3B8` | `#475569` |

**El color nunca va solo**: cada sesión lleva icono y etiqueta. Un calendario que solo distinga por color es inutilizable para un daltónico.

**Estado de cada día**, tomado del patrón de TrainingPeaks (color por cumplimiento) y de Runna (barra vertical + check, frame `v3/sec_009.jpg`):

- Planificado — contorno del color del tipo
- Completado — relleno + marca de verificación
- Saltado — contorno atenuado con línea diagonal
- Movido — contorno con icono de flecha
- Hoy — anillo del color de marca

**Reprogramar arrastrando, con las reglas de Runna** (`02-benchmark.md` §2.5), que son la mejor decisión de producto del benchmark:

1. Solo dentro de la misma semana o ±1 semana.
2. Solo a un día que no tenga ya una sesión del plan.
3. **No se pueden borrar sesiones del plan** — se marcan como saltadas. La progresión depende de ellas.
4. Mantener pulsado levanta la tarjeta (haptic), los días válidos se iluminan, los inválidos se atenúan.

**Un día vacío es un "+ Añadir"**, no un hueco muerto (patrón de Runna, frame `v3/sec_009.jpg`).

### 4.3 Módulo de running

**Tipos de sesión** (columna `run_type` de `06-modelo-datos.md` §B): rodaje suave, tirada larga, series, tempo, recuperación, carrera. Son los que aparecen tanto en Runna como en RunnerPro.

**Plan por objetivo**: distancia (5k / 10k / media / maratón), fecha de carrera, días disponibles y día de la tirada larga. Ese es el conjunto mínimo que piden **todas** las apps de plan del benchmark (`02-benchmark.md` §2.8). Genera `scheduled_sessions` con `run_spec`.

**Estructura de sesión explícita**: calentamiento / bloques / vuelta a la calma. Es estándar en las apps de plan y hoy no existe en FitGame Pro ni para fuerza.

**Registro manual primero.** `03-integraciones.md` §5 lo argumenta: funciona en todos los dispositivos, sin OAuth ni cuotas. Campos: distancia, duración, tipo, esfuerzo percibido y notas. El ritmo **se calcula, no se pide**.

**Importación desde Strava** después, con lo que ya está decidido en `03-integraciones.md`: Edge Function para el intercambio de token, webhooks en vez de polling, e índice único parcial contra duplicados.

**Lo que NO se construye:** grabación con GPS en vivo. Una PWA puede leer geolocalización, pero mantener un registro fiable con la pantalla apagada y la app en segundo plano no es algo que un navegador garantice **[estimado: es el límite conocido de las PWA; no lo he verificado con una prueba]**. Prometer un tracker GPS y entregar un registro con huecos es peor que no prometerlo.

### 4.4 Gamificación: cómo encaja lo que ya existe

**Se conserva**: XP con desglose, 20 badges en 5 categorías, escalera de 5 tiers, retos semanales y sociales, congeladores de racha, periodización en 3 fases.

**Cambia la racha: de diaria a semanal.** Es el hallazgo más contundente del benchmark (`02-benchmark.md` §2.4): Hevy usa semanas consecutivas y NRC razona explícitamente que lesión, viaje y descanso son parte del deporte. **Una racha diaria en una app de fuerza empuja a entrenar sin recuperar.** Definición propuesta: semanas consecutivas con al menos una sesión completada, contando desde el lunes.

Esto además resuelve un problema que ya existe: `notifyStreakAtRisk()` (`App.tsx:69-79`) avisa cada día en que no has entrenado, incluido un día de descanso planificado. Con racha semanal, el aviso solo tiene sentido si queda poco para el domingo sin ninguna sesión.

**Se amplía a running**: badges de distancia acumulada (el patrón de niveles de NRC), tipos de reto `distance` y `run_sessions` (ya previstos en `06-modelo-datos.md` §E), y XP por minuto en movimiento con modificador por tipo de sesión.

**Lo que no se copia**: leaderboards con datos de Strava. El acuerdo de API lo prohíbe expresamente (`03-integraciones.md` §1) — los datos de un usuario solo se le pueden mostrar a él.

**Patrón nuevo, tomado de Runna** (`01-referencias-video.md`, frame `v3/scene_015.jpg`): separar los puntos **de una sola vez** (conectar Strava, completar el perfil, crear la primera rutina) de los **recurrentes** (completar sesión, batir un récord). Los primeros son una herramienta de activación y hoy no se usan.

---

## 5. Wireframes de las 8 pantallas clave

Las 8 corresponden una a una con el mapa de la §3.

### 5.1 Hoy

```
┌────────────────────────────────┐
│ Buenos días, Miguel      🔥 6  │  ← racha SEMANAL (semanas)
│                                │
│ ████████████░░░░░  Nivel 12    │  ← barra XP
│ 2.340 / 3.100 XP               │
│                                │
│ ┌────────────────────────────┐ │
│ │ HOY · MARTES               │ │
│ │ ● Fuerza                   │ │  ← punto naranja + etiqueta
│ │                            │ │
│ │ Empuje A                   │ │
│ │ 5 ejercicios · ~50 min     │ │
│ │                            │ │
│ │ ┌────────────────────────┐ │ │
│ │ │      EMPEZAR           │ │ │  ← CTA, violeta, 56px
│ │ └────────────────────────┘ │ │
│ │  Mover  ·  Saltar          │ │
│ └────────────────────────────┘ │
│                                │
│ Esta semana        3 de 4  ✓✓✓○│
│                                │
│ ┌─────────────┐ ┌────────────┐ │
│ │ Reto        │ │ Siguiente  │ │
│ │ 4 sesiones  │ │ Mié        │ │
│ │ ███████░ 3/4│ │ ● Rodaje   │ │
│ └─────────────┘ └────────────┘ │
├────────────────────────────────┤
│  Hoy   Plan    ➕   Progr  Perf│
└────────────────────────────────┘
```

*Decisiones:* una sola acción primaria; "Mover" y "Saltar" presentes pero secundarias (el plan se adapta, no se rompe); la semana se muestra como progreso hacia el objetivo, no como calendario.

### 5.2 Plan — vista semana

```
┌────────────────────────────────┐
│ Plan              [Semana|Mes] │
│ ← Semana 4 de 12            →  │
│                                │
│ L    M    X    J    V    S    D│
│ ✓    ●    ○    ○    ○    ○    ─│
│ ●    ●    ●    ─    ●    ●    ─│  ← 2ª fila: 2ª sesión del día
│      ▲                         │  ← día seleccionado
│                                │
│ MARTES 14                      │
│ ┌────────────────────────────┐ │
│ │▐ ● Empuje A                │ │  ← barra vertical de color
│ │▐   5 ejercicios · 50 min   │ │
│ │▐   Planificado         ⠿   │ │  ← asa de arrastre
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │▐ ● Rodaje suave            │ │
│ │▐   6 km · ritmo 5:45       │ │
│ │▐   Planificado         ⠿   │ │
│ └────────────────────────────┘ │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│ │        + Añadir            │ │  ← el hueco es una acción
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
├────────────────────────────────┤
│  Hoy   Plan    ➕   Progr  Perf│
└────────────────────────────────┘
```

### 5.3 Plan — vista mes

```
┌────────────────────────────────┐
│ Plan              [Semana|Mes] │
│ ← Marzo 2026                →  │
│                                │
│  L   M   X   J   V   S   D     │
│                  1   2   3     │
│  ··      ·               ·     │
│  4   5   6   7   8   9  10     │
│  ✓·  ✓   ✓·      ✓   ·         │
│ 11  12  13 (14) 15  16  17     │  ← (14) = hoy, con anillo
│  ✓   ✓   ⊘   ··  ·   ·         │  ← ⊘ = saltado
│ 18  19  20  21  22  23  24     │
│  ·   ·   ·   ·   ·   ·         │
│                                │
│ ● Fuerza  ● Carrera  ● Descanso│  ← leyenda siempre visible
│                                │
│ Marzo: 14 de 18 · 62 km        │
├────────────────────────────────┤
│  Hoy   Plan    ➕   Progr  Perf│
└────────────────────────────────┘
```

### 5.4 Sesión de fuerza (registro en línea)

La pantalla más usada de la app. Sustituye al modal por serie de hoy (`components/session/SetInputModal.tsx`).

```
┌────────────────────────────────┐
│ ✕  Empuje A          32:14  ⋮  │  ← cifras tabulares
│ ●●●○○  Ejercicio 3 de 5        │
├────────────────────────────────┤
│ Press banca                    │
│ Objetivo 4×8 · RPE 8       ⓘ   │
│                                │
│  #   ANTERIOR   KG    REPS   ✓ │
│  1   80×8      [80]   [8]   ✅ │
│  2   80×8      [80]   [8]   ✅ │
│  3   80×7      [82]   [7]   ⬜ │  ← fila activa, resaltada
│  4   —         [82]   [ ]   ⬜ │
│                                │
│  + Añadir serie                │
│                                │
│ ┌────────────────────────────┐ │
│ │  ⏱ Descanso    1:24   −15 +15│ │  ← arranca solo al marcar ✓
│ └────────────────────────────┘ │
│                                │
│ ←  Anterior      Siguiente  →  │
├────────────────────────────────┤
│         TERMINAR SESIÓN        │
└────────────────────────────────┘
```

*Decisiones, todas respaldadas por `02-benchmark.md` §2.3, §2.7 y §2.9:*
- Peso y reps **editables en la propia fila**. Ningún modal.
- **Un tap en ✓ completa la serie y arranca el descanso.** El gesto único de toda la categoría.
- Columna ANTERIOR siempre visible como referencia.
- Deslizar a la izquierda sobre una fila la borra; tocar el número de serie cambia su tipo (calentamiento / normal / descendente / al fallo).
- Timer **por ejercicio**, con ±15 s en caliente.
- RPE como columna opcional, desactivada por defecto.
- Al tocar un campo numérico sube un **teclado propio** con teclas grandes, no el del sistema (hueco de mercado identificado en `02-benchmark.md` §3.2).

### 5.5 Sesión de carrera (registro manual)

```
┌────────────────────────────────┐
│ ✕  Registrar carrera           │
│                                │
│ TIPO                           │
│ (Rodaje) Largo  Series  Tempo  │  ← chips
│                                │
│ DISTANCIA                      │
│ ┌────────────────────────────┐ │
│ │        8,00           km   │ │  ← 39px, tabular
│ └────────────────────────────┘ │
│                                │
│ DURACIÓN                       │
│ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │  00  │ │  46  │ │  30  │     │
│ │  h   │ │ min  │ │  s   │     │
│ └──────┘ └──────┘ └──────┘     │
│                                │
│ ┌────────────────────────────┐ │
│ │  Ritmo  5:48 /km           │ │  ← calculado, no editable
│ └────────────────────────────┘ │
│                                │
│ ESFUERZO PERCIBIDO             │
│ 1─2─3─4─5─6─(7)─8─9─10         │
│           Cómodo-duro          │
│                                │
│ Notas (opcional)               │
│ ┌────────────────────────────┐ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│           GUARDAR              │
└────────────────────────────────┘
```

*El ritmo se calcula y se muestra en vivo mientras se escribe.* Es feedback inmediato y evita guardar un dato derivado (`06-modelo-datos.md` §B).

### 5.6 Resumen de sesión

```
┌────────────────────────────────┐
│                                │
│          ✦  +285 XP  ✦         │  ← animación xp-fly
│                                │
│         Empuje A                │
│       52 min · 18 series       │
│                                │
│ ┌────────────────────────────┐ │
│ │ 🏆  RÉCORD PERSONAL        │ │  ← ámbar, solo si lo hay
│ │     Press banca  82 kg × 7 │ │
│ └────────────────────────────┘ │
│                                │
│ DESGLOSE DE XP                 │
│ Series completadas   18×5  90  │
│ Series con RPE 9+     3×10  30 │
│ Récord personal       1×25  25 │
│ Sesión completa            30  │
│ Racha ×1,12 (6 sem)       +21  │
│ Bonus mañana ×1,2         +89  │
│ ─────────────────────────────  │
│ Total                     285  │
│                                │
│ ¿Cómo ha ido?                  │
│  😣   😐   🙂   💪             │
│                                │
│ Notas de sesión                │
│ ┌────────────────────────────┐ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│            HECHO               │
└────────────────────────────────┘
```

*El desglose de XP ya existe (`services/xp.ts:79-90`) y es un activo: explicar por qué has ganado lo que has ganado es lo que separa una recompensa de un número arbitrario.*

### 5.7 Progreso

```
┌────────────────────────────────┐
│ Progreso                       │
│ [Fuerza]  Carrera              │  ← pestañas por disciplina
│                                │
│ 4 sem · 3 meses · 1 año        │
│                                │
│ VOLUMEN SEMANAL                │
│  ▁▃▅▇▆█▅▇                      │
│  12,4 t esta semana    ↑ 8%    │
│                                │
│ ┌─────────────┐ ┌────────────┐ │
│ │ Sesiones    │ │ Récords    │ │
│ │ 14          │ │ 3          │ │
│ │ ↑ 2         │ │ este mes   │ │
│ └─────────────┘ └────────────┘ │
│                                │
│ EJERCICIOS PRINCIPALES         │
│ ┌────────────────────────────┐ │
│ │ Press banca                │ │
│ │ 1RM est. 102 kg     ↑ 4 kg │ │
│ │ ▁▂▃▃▄▅▅▆                   │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ Sentadilla                 │ │
│ │ 1RM est. 138 kg     → 0 kg │ │
│ └────────────────────────────┘ │
│                                │
│ Ver historial completo      →  │
├────────────────────────────────┤
│  Hoy   Plan    ➕   Progr  Perf│
└────────────────────────────────┘
```

*Las métricas son el trío obligatorio del benchmark (`02-benchmark.md`, patrones de gym): volumen, 1RM estimado y récords. La pestaña Carrera muestra kilómetros semanales, ritmo medio y mejores marcas por distancia.*

### 5.8 Perfil

```
┌────────────────────────────────┐
│ Perfil                     ⚙   │
│                                │
│      ╭───────╮                 │
│      │  👤   │   Miguel        │
│      ╰───────╯   Nivel 12      │
│                  Intermedio    │
│                                │
│ ████████████░░░░░ 2.340/3.100  │
│                                │
│ ┌────────┐┌────────┐┌────────┐ │
│ │ 🔥 6   ││ 🏆 12  ││ ⚡ 148 │ │
│ │semanas ││ logros ││sesiones│ │
│ └────────┘└────────┘└────────┘ │
│                                │
│ LOGROS                    12/20│
│ ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐      │
│ │🥇││🔥││💪││📅││🏋││ ? │      │  ← bloqueados en silueta
│ └──┘└──┘└──┘└──┘└──┘└──┘      │
│                       Ver todo │
│                                │
│ PRIMEROS PASOS            2/4  │  ← puntos de una sola vez
│ ✓ Completa tu perfil      +25  │
│ ✓ Crea tu primera rutina  +25  │
│ ○ Conecta Strava          +50  │
│ ○ Completa una semana     +100 │
│                                │
│ Retos              ·  2 activos│
│ Ejercicios                     │
│ Ajustes                        │
├────────────────────────────────┤
│  Hoy   Plan    ➕   Progr  Perf│
└────────────────────────────────┘
```

*"Primeros pasos" es el patrón de puntos de una sola vez de Runna (frame `v3/scene_015.jpg`): separa la activación del uso recurrente y pone la conexión con Strava donde se ve.*

---

## 6. Gestos y transiciones

| Gesto | Dónde | Qué hace |
|---|---|---|
| Deslizar horizontal | Sesión activa | Cambiar de ejercicio |
| Deslizar izquierda | Fila de serie | Borrar |
| Mantener pulsado + arrastrar | Calendario | Reprogramar (con las reglas de §4.2) |
| Deslizar abajo | Sheets | Cerrar |
| Tirar hacia abajo | Hoy, Progreso | Sincronizar |
| Tocar el número de serie | Sesión activa | Cambiar tipo de serie |

Transiciones: cambio de pestaña sin animación de desplazamiento (es un cambio de contexto, no de jerarquía); apertura de detalle con desplazamiento lateral; sheets con la curva `cubic-bezier(.32,.72,0,1)` de `04-design-system.md` §8. Todo bajo `prefers-reduced-motion`.

---

## 7. Lo que se queda fuera, y por qué

| Descartado | Motivo |
|---|---|
| Feed social | Arquetipo equivocado (§1). Los retos sociales por código ya cubren la necesidad sin feed |
| Leaderboards con datos de Strava | Lo prohíbe el acuerdo de API (`03-integraciones.md` §1) |
| Grabación GPS en vivo | Límite real de las PWA en segundo plano (§4.3) |
| Tab de "Programas" separada | Se absorbe en Plan; eran tres entradas para la misma pregunta |
| Sidebar en móvil | Sustituida por la barra inferior. **Se conserva en escritorio**: el shell actual funciona bien ahí y no hay razón para romperlo |
