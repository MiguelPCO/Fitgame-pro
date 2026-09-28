# 02 — Benchmark de 16 apps

> Síntesis de la investigación web de tres frentes (running / gym / casa-planificación). **Cada dato tiene fuente citada en los informes de origen**; aquí se consolida y se cita la URL cuando es un dato concreto. Lo marcado **[estimado]** es inferencia, no dato verificado. Lo marcado **[no verif.]** es que no se encontró fuente pública.

---

## 1. Tabla comparativa

### Running

| App | Onboarding | Navegación | Planificador | Calendario | Gamificación | Integraciones | Modo oscuro |
|---|---|---|---|---|---|---|---|
| **Runna** | ~15 pantallas: objetivo → nivel/lesiones → tiempo objetivo → días + día de tirada larga → notificaciones → preferencias → add-on fuerza → **resumen** → paywall. Sin indicador de progreso | **5 tabs**: Today · Plan · Progress · Calendar · Profile | Planes hasta 26 semanas; catálogo amplio (5k-50k, retorno, postparto, Hyrox, triatlón) | **Tab propia**. Drag & drop con reglas: ±1 semana, solo a días libres, **no se pueden borrar sesiones**. Holiday Mode 3-21 días | Runna Level, logros, planes completados, Spaces (comunidad). **Sin rachas ni leaderboards** [no verif.] | Strava, Apple Health/Watch (WorkoutKit), Garmin (solo running), COROS, Suunto, Fitbit, Health Connect | [no verif.] |
| **RunnerPro** | Formulario ~2 min; **plan hecho por entrenador humano en <24 h**. Trial 14 días sin tarjeta | [no verif.] [estimado: 4-5, chat como tab] | Plan semanal diseñado a mano; adaptaciones ilimitadas | Vista semanal + calendario; reprograma el entrenador por chat [estimado] | **Ninguna.** El caso anti-gamificación: la motivación es el humano (chat 9-21h) | Garmin, Strava, Apple Health/Watch, Polar, Suunto, COROS, Amazfit | [no verif.] |
| **Strava** | Solo cuenta y perfil; **no pregunta objetivos**. Sin paywall de entrada | **5 tabs** (rediseño 2025): Home · Maps · Record · Groups · You | **No planifica.** Training Log retrospectivo, solo de pago | No hay calendario planificador | **La más completa**: segmentos KOM/QOM + **Local Legend** (más repeticiones en 90 días → premia constancia), retos, Trophy Case, kudos | El hub del ecosistema: Garmin, TrainingPeaks, Apple Health, decenas más | ✅ You → Preferences → Appearance: **sistema / claro / oscuro** |
| **Nike Run Club** | Solo crea cuenta; **no enseña el producto**. **Sin paywall: gratis total** | Tabs con sección Activity; nº exacto [no verif.] | 6 planes adaptativos guiados (5k-maratón), no editables | Sin calendario editable | **Niveles por km acumulados** (0-49 / 50-249 / 250-999 / 1000-2499 km), badges, trofeos mensuales por volumen, **rachas SEMANALES**, **sin leaderboards** | Apple Health/Watch, Siri, Garmin, COROS, Strava, Apple Music/Spotify | Existe modo oscuro/"twilight" [solo fuentes secundarias] |
| **adidas Running** | **9 pasos con checklist visible**. Paywall blando justo después, con "LIMITED-TIME OFFER" | **5 tabs**: Activity · Progress · News Feed · Community · Profile. **Abre en Activity** (listo para grabar) | Planes adaptativos que se recalibran con el feedback | Sin drag & drop documentado | Retos, carreras virtuales, badges, **leaderboards por persona/país/grupo**, Live Cheers | Health Connect, Garmin, Polar, COROS, Suunto, Wahoo, Apple Watch | [no verif.] |
| **TrainingPeaks** | De herramienta profesional: umbrales por deporte (FC, potencia, ritmo). Sin quiz. Basic gratis + Premium con 14 días | Ancla en Home; tabs exactas [no verif.] | **Periodización real**: ATP con eventos A/B/C | Semana y mes. **Color por cumplimiento**: verde ±20% de lo planificado, rojo no completado, gris no planificado. **Drag & drop solo en web** | **Prácticamente nula.** Refuerzo analítico (Fitness/Fatigue/Form, TSS) y chat con el coach | 100+ dispositivos: Garmin, Wahoo, Apple Health, Strava, Zwift | ✅ solo en móvil (no en web) |

### Gimnasio

| App | Onboarding | Navegación | Planificador | Calendario | Gamificación | Integraciones | Modo oscuro |
|---|---|---|---|---|---|---|---|
| **Hevy** | 10 pasos. **Paywall antes de tocar nada**, 3 tiers, **sin trial** (su propio teardown lo marca como riesgo de abandono) | **4 tabs**: Workout · Home (feed) · Profile · Discovery | Rutinas en carpetas, no programas periodizados. Existe Hevy Trainer | En Profile → Calendar: mes / año / multi-año. Es **registro de consistencia**, no planificador | **Racha por semanas consecutivas** (no días), leaderboards, feed social, PR en vivo | Apple Health, Health Connect, Strava (auto-publica), Apple Watch live sync. **Garmin no** (lo admiten) | ✅ (automático o manual: [no verif.]) |
| **Strong** | [no verif.] Free de por vida con 3 rutinas; PRO 4,99 $/mes | [no verif.] "Tres taps para loggear una serie" | Rutinas custom + scheduling | Widgets de calendario | **Casi nula**: sin feed ni rachas. "Diseñada para quitarse de en medio" | Apple Health, Apple Watch, **Wear OS**, Health Connect, **export CSV** | ✅ |
| **Fitbod** | **14 pasos**, pero **enseña la proyección de fuerza antes de pedir cuenta**; paywall tras generar el primer entreno | [no verif.] | Generador algorítmico con recuperación muscular | — | Sin social | Strava (**importa además de publicar**), Apple Health | [no verif.] |
| **JEFIT** | — | **3 tabs**: Workout · Progress · Discover | **Mesociclos y periodización explícita** — la excepción de la categoría | Días de la semana asignados | Social, leaderboards | Apple Health | ✅ |

### Casa

| App | Onboarding | Navegación | Planificador | Calendario | Gamificación | Integraciones | Modo oscuro |
|---|---|---|---|---|---|---|---|
| **Nike Training Club** | Mínimo. **Gratis total, sin trial** | — | Programas guiados | — | Badges y logros | Apple Health | [no verif.] |
| **Freeletics** | **25 pasos** + animación "Building your plan". **Dos paywalls encadenados**, el segundo con 50% y contador | — | Plan adaptativo por feedback | **Semana flexible**: sesiones en cualquier orden, reubica lo hecho al día real | Retos creados por usuarios, referidos | [no verif.] | [no verif.] |
| **Sweat** | 12 pasos con **vídeo inicial no saltable**. Paywall duro tras el email | **5 tabs** incl. Food y Community | Programas por semanas numeradas | Toggle "Suggested Workout Plan" que **autorrellena el calendario** | Comunidad, foros | — | [no verif.] |

### Planificación / híbrido

| App | Onboarding | Navegación | Planificador | Calendario | Gamificación | Integraciones | Modo oscuro |
|---|---|---|---|---|---|---|---|
| **Ladder** | Muestra el **timeline de la prueba** en vez del precio | — | Plan nuevo cada 7 días, 1 coach por equipo. 29,99 $/mes | — | Equipo + muro de selfies | — | [no verif.] |
| **Future** | — | — | Coach 1:1, 149-199 $/mes. Plan visible el domingo por la noche | Mover entrenos y **fechas de vacaciones** en el perfil | Social-humana (mensajes del coach) | Apple Watch (watchOS 10+) | [no verif.] |
| **Final Surge** | — | — | **Gratis para el atleta, paga el coach** | Drag & drop con scroll infinito | — | Empuja entrenos estructurados **al** Garmin | [no verif.] |

---

## 2. Los 10 patrones que más se repiten

### 1. La navegación se elige según lo que prometes, y son dos arquetipos incompatibles
Las apps **de plan** (Runna, TrainingPeaks, RunnerPro) anclan en un "Hoy" que responde *¿qué toca?*. Las apps **de tracking** (Strava, adidas, NRC, Hevy) anclan en el feed o en el botón de grabar. Mezclar las dos cosas es exactamente lo que llena la barra de ruido.
> **Para FitGame Pro:** la app promete plan personalizado, así que va el arquetipo de plan: ancla en Hoy. Las 10 entradas actuales (`00-estado-actual.md` §7.2) son el síntoma de no haber elegido.

### 2. De 3 a 5 tabs. Nunca más
Hevy 4, JEFIT 3, Strava 5, Runna 5, adidas 5, Sweat 5. **Ninguna app verificada pasa de 5.** Y el progreso casi siempre vive dentro del perfil, no en una tab propia.

### 3. Un solo gesto para completar una serie
**Un tap en el checkmark completa la serie y arranca el temporizador de descanso.** Es idéntico en Hevy y Strong, y es el corazón de toda la categoría gym.
> El modal por serie que usa FitGame Pro hoy (`components/session/SetInputModal.tsx`) es exactamente el antipatrón. Esto queda confirmado, ya no es estimación.

### 4. La racha es semanal, no diaria — y es unánime entre quienes lo razonan
Hevy usa semanas consecutivas con al menos una sesión. NRC lo argumenta explícitamente: lesión, viaje y descanso son parte del deporte. Una racha diaria en una app de fuerza es un **incentivo perverso contra la recuperación**.
> FitGame Pro usa racha diaria (`services/xp.ts:9-23`). Es el cambio de gamificación más importante del rediseño, y tiene mitigación parcial ya construida: los `StreakFreezeState`.

### 5. Reprogramar es drag & drop, pero con reglas
Runna limita el movimiento a ±1 semana, solo a días libres, y **prohíbe borrar sesiones del plan** porque la progresión depende de ellas. TrainingPeaks y Final Surge también arrastran. Es flexibilidad sin dejar que el usuario rompa su propio plan — la mejor decisión de producto de todo el set.

### 6. El plan se adapta sin castigar
Runna tiene Holiday Mode (3-21 días, con niveles de carga). Freeletics tiene "Adapt Session", que regenera el entreno si no hay espacio, no hay material, **necesitas silencio** o **tienes una zona dolorida**. Freeletics además deja completar la semana en cualquier orden. Future acepta fechas de vacaciones.
> **Un plan que se rompe es un plan que se abandona.** Es requisito de retención, no un extra.

### 7. El autocompletado del anterior, con su ambigüedad resuelta
Se precargan series, peso y reps de la última vez, editables, con el valor anterior visible a la izquierda de cada fila. Hevy va más allá y convierte en **ajuste explícito** la pregunta "¿el anterior es la última vez que hice el ejercicio, o la última vez dentro de esta rutina?". No resolverlo produce sugerencias de peso equivocadas.

### 8. Onboarding largo, pero pagado con una recompensa visible antes del muro
Runna ~15 pantallas, Fitbod 14, Freeletics 25, adidas 9. Todas las que convierten insertan **un resumen personalizado, una proyección o una checklist** antes del paywall. El orden ganador: objetivo → nivel actual → disponibilidad semanal → preferencias → **resumen** → muro → generación del plan.

### 9. El temporizador de descanso es por ejercicio y visible fuera de la app
Hevy: de 5 s a 5 min **por ejercicio**, default global, botones ±15 s en caliente, notificación al llegar a cero. Strong lo lleva a Live Activity / Dynamic Island para verlo con el móvil bloqueado. Y "Keep Awake During Workout" es un ajuste explícito: la pantalla no puede apagarse entre series.

### 10. Apple Health / Health Connect es la tubería; Strava es la capa social
Todas las apps verificadas se apoyan en Apple Health y Health Connect como sustrato de datos y publican en Strava. **Garmin es el agujero de toda la categoría gym** — Hevy admite públicamente que no puede integrarlo.
> Combinado con `03-integraciones.md`: las dos tuberías estándar del sector son **precisamente las que una PWA no puede tocar**. Es la restricción estructural del proyecto y hay que asumirla de frente.

---

## 3. Errores que conviene evitar

Ordenados por lo aplicable que es a FitGame Pro.

### En la sesión

1. **Modal a mitad de circuito.** Fitbod espera a que termine **todo** el superset antes de pedir el RiR. Cualquier modal que interrumpa un circuito es un error.
2. **Teclado del sistema para meter pesos.** Teclas pequeñas, con las manos sudadas, a una mano, entre series. Nadie del benchmark documenta un teclado propio: es un hueco real de mercado. La referencia es un keypad con teclas grandes y haptic por dígito, objetivos de más de 44×44px y el botón de confirmar en la zona del pulgar.
3. **Un único temporizador global sin override.** El descanso de una serie pesada de sentadilla y el de un curl no son el mismo.
4. **Dejar que la pantalla se apague durante el entreno.**
5. **Pantalla de registro sobrecargada.** El propio teardown de Hevy la describe como "packed with information": eficiente para el experto, dura para el novato.
6. **Tipos de serie escondidos en un menú.** Crítica concreta a Strong: drop sets y myo-reps "se sienten añadidos a posteriori". Warm-up, drop set y fallo son primitivas, no extras.
7. **Poner los supersets detrás del paywall** (Strong PRO). Es una primitiva de entrenamiento.

### En el plan y el calendario

8. **Racha diaria en una app de fuerza** (ver patrón 4).
9. **Calendario vacío que obliga a planificar a mano.** Sweat lo resuelve con un toggle que autorrellena con el plan sugerido.
10. **Plan rígido que se rompe al saltarse un día.**
11. **Reprogramar en móvil sin arrastrar** (TrainingPeaks): obliga a cruzar varias pantallas para algo que en web es un gesto. Queja recurrente de sus usuarios.
12. **Paridad rota entre móvil y web** (TrainingPeaks no deja construir entrenos de fuerza en móvil). En una app móvil-first, descalificatorio.
13. **Degradar al usuario gratuito a mero ejecutor.** En TrainingPeaks básico no puedes ni **mover** tus propios entrenos. Limitar el análisis es aceptable; limitar el control del propio calendario, no.

### En el onboarding y la conversión

14. **Onboarding largo sin indicador de progreso** (Runna). adidas lo resuelve con checklist visible.
15. **Pedir registro antes de dejar tocar nada** (Hevy). Contramodelo: Fitbod enseña la proyección de fuerza antes de pedir cuenta.
16. **Vídeo inicial no saltable** (Sweat).
17. **Urgencia artificial en el paywall**: "LIMITED-TIME OFFER" de adidas, o el segundo paywall de Freeletics con 50% y contador regresivo tras rechazar el primero. Convierte y quema confianza a la vez.
18. **Onboarding que solo crea la cuenta y no enseña el producto** (NRC): las funciones más potentes quedan sin descubrir.
19. **No preguntar por lesiones.** Ninguna app verificada lo hace en el onboarding, y las quejas de Future muestran el coste. **FitGame Pro ya tiene el campo `limitations` en `UserProfile`** — es una ventaja gratuita que ya está en el modelo de datos.

### En datos e integraciones

20. **Edición que destruye datos** (Strava en web: hay que borrar y recrear la actividad, perdiendo kudos, comentarios y fotos).
21. **Sincronización unidireccional.** Fitbod **importa** de Strava además de publicar, para que su algoritmo cuente el cardio. Publicar sin leer deja el modelo ciego.
22. **Sin exportación de datos** el usuario se siente secuestrado. Solo Strong lo confirma públicamente — y **FitGame Pro ya exporta CSV** (`pages/Settings.tsx`).
23. **Sincronización parcial que el usuario no anticipa** (Runna ↔ Garmin: solo cruzan sesiones de running; fuerza y yoga no van en ninguna dirección).
24. **Funciones que se desactivan en silencio.** Los audio cues de Runna se apagan con ciertas combinaciones de ajustes y reloj, y el usuario lo descubre a mitad de sesión.

---

## 4. Lo que este benchmark cambia respecto a `00-estado-actual.md`

| Suposición previa | Veredicto |
|---|---|
| "El modal por serie es peor que el registro en línea" **[estimado]** | **Confirmado.** Hevy y Strong comparten el mismo gesto único; es el estándar de la categoría |
| "10 ítems de nav son demasiados" | **Confirmado.** Ninguna app verificada pasa de 5 tabs |
| "La racha diaria está bien" (implícito en el código) | **Refutado.** El estándar es semanal, y NRC y Hevy lo razonan explícitamente |
| "El onboarding de 7 pasos es largo" | **Matizado.** 7 pasos es corto para el sector (Freeletics 25, Runna ~15). El problema no es la longitud, es que **no hay recompensa visible antes del final** |
| "Faltan integraciones" | **Matizado.** Las dos tuberías estándar (Apple Health, Health Connect) son técnicamente inalcanzables desde una PWA. Ver `03-integraciones.md` |
