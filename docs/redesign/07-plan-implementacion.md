# 07 — Plan de implementación

> Siete fases en el orden pedido. Cada una con archivos afectados, riesgos y criterios de aceptación. **No se ha implementado nada**; esto es el plan. Las estimaciones de esfuerzo van marcadas **[estimado]** porque no hay histórico de velocidad en este proyecto.

---

## Fase 0 — Prerrequisito: rutas reales

**No estaba en la lista pedida, pero bloquea tres fases.** El routing por estado (`App.tsx:81`, `CLAUDE.md:116`) impide el botón atrás de Android, los deep links desde notificación y **el callback OAuth de Strava** (`03-integraciones.md` §5). Intentar hacer la Fase 7 sin esto no funciona.

**Archivos:** `App.tsx`, `lib/constants.ts` (ROUTES pasa a rutas con barra), `components/Layout.tsx`, las 16 páginas (solo las props de navegación), `vercel.json` (ya reescribe a `index.html`, sirve).

**Riesgo:** es un cambio transversal que toca todo. Mitigación: los 36 tests E2E de Playwright navegan la app y detectarán las rutas rotas — **ejecutarlos antes y después es la red de seguridad**.

**Criterios de aceptación:**
- Cada pantalla tiene URL propia y recargar mantiene la pantalla.
- El botón atrás de Android retrocede dentro de la app, no sale.
- Los 36 E2E siguen en verde.
- Las páginas legales siguen siendo públicas.

**Esfuerzo:** medio-alto [estimado].

---

## Fase 1 — Tokens

Implantar el sistema de `04-design-system.md`: color con contraste verificado, escala de tipo, espaciado, radios, sombras, motion.

**Archivos:** `tailwind.config.js`, `index.css`, `DESIGN.md` (actualizar, no reescribir: lo conservado se documenta como conservado), `hooks/useTheme.ts`, `components/ui/*` (Button, Card, Badge, Input, Modal, Toast).

**Decisión que necesita aprobación previa:** el cambio del acento de marca de rojo a violeta (`04-design-system.md` §2). Si se rechaza, esta fase se reduce a arreglar el contraste del modo claro y separar el rojo de marca del rojo destructivo, que hay que hacer igualmente.

**Riesgos:**
- El rojo `#DC2626` está **hardcodeado en varios sitios** pese a la regla de `CLAUDE.md:233-245`: `components/Layout.tsx` usa `shadow-[0_0_15px_rgba(220,38,38,0.1)]` y `shadow-[0_0_8px_#DC2626]`. Hay que buscarlos todos antes de empezar.
- El modo claro no está auditado. Es probable que aparezcan fallos de contraste ya existentes.

**Criterios de aceptación:**
- Ningún color literal fuera de `tailwind.config.js` (verificable con `grep -rE "#[0-9A-Fa-f]{6}" --include="*.tsx"`).
- Todos los pares de texto/fondo de ambos modos pasan AA, comprobado con el script de contraste.
- El rojo aparece **solo** en acciones destructivas.
- Los 138 tests unitarios siguen en verde.
- `npm run build` sin errores y sin crecer más de un 5% [estimado].

---

## Fase 2 — Shell móvil

Barra inferior de 5 destinos, cabecera de 48px, bottom sheets. Sidebar conservada en escritorio.

**Archivos:** `components/Layout.tsx` (reescritura), nuevo `components/nav/BottomNav.tsx`, nuevo `components/ui/Sheet.tsx`, `App.tsx`, `components/ui/Modal.tsx` (los modales de móvil pasan a sheets).

**Riesgos:**
- La consolidación de 10 destinos a 5 **esconde pantallas** que hoy son de primer nivel (Programas, Ejercicios, Historial). Si alguien las usa a diario, lo notará. Mitigación: las tres siguen alcanzables en dos toques.
- `env(safe-area-inset-bottom)` hay que probarlo en un iPhone real; el emulador miente.

**Criterios de aceptación:**
- 5 destinos, ningún objetivo táctil por debajo de 44×44px.
- La barra respeta la safe area y no tapa el último elemento de ninguna lista.
- Las 16 pantallas alcanzables en ≤2 toques desde cualquier punto.
- Escritorio sin cambios visibles.
- E2E de navegación móvil actualizados y en verde.

---

## Fase 3 — Onboarding

Barra de progreso, paso 0 de disciplina, pregunta de lesiones, micro-reacciones.

**Archivos:** `pages/Onboarding.tsx`, `lib/templateGenerator.ts` (debe generar planes de carrera, no solo de gimnasio), `types/index.ts` (campo de disciplina), migración de `profiles`.

**Riesgo:** el generador de plantillas actual asume gimnasio. Si el usuario elige "solo carrera", **hoy no hay nada que generar**. Esta fase depende de que la Fase 5 exista, o hay que entregar un plan de carrera mínimo aquí.

> Esta dependencia es real y es el motivo de que sugiera **hacer la Fase 5 antes que la 3**, o partir la 3 en dos. Lo dejo señalado en vez de resolverlo por mi cuenta, porque cambia el orden que pediste.

**Criterios de aceptación:**
- Barra de progreso visible desde el paso 1.
- Elegir "solo carrera" produce un plan válido.
- Las lesiones se guardan y se muestran en la generación del plan.
- Un usuario existente con `onboarding_completed = true` no vuelve a verlo.

---

## Fase 4 — Calendario

Vistas de semana y mes sobre `scheduled_sessions`, con colores por tipo y reprogramación arrastrando.

**Archivos:** migración de `scheduled_sessions` + `training_plans` (`06-modelo-datos.md` §C y §D), `pages/Schedule.tsx` (reescritura completa), nuevos `components/calendar/WeekStrip.tsx`, `MonthGrid.tsx`, `DaySheet.tsx`, `context/AppContext.tsx`, `services/` nuevo servicio de planificación, `types/database.ts` regenerado.

**Riesgos:**
- **Migrar el `weekly_schedule` existente.** Los usuarios actuales tienen un mapa día-a-plantilla que hay que proyectar a filas con fecha. Decidir cuántas semanas hacia delante se generan. Si se hace mal, se pierde el plan de alguien.
- **El arrastre en móvil es difícil de hacer bien.** Compite con el scroll vertical. Mantener pulsado para levantar es obligatorio, no opcional.
- Zonas horarias: `scheduled_for` es `DATE` precisamente para evitar que el entreno cambie de día al viajar (`06-modelo-datos.md` §C).

**Criterios de aceptación:**
- Semana y mes leen los mismos datos y nunca se contradicen.
- Arrastrar respeta las tres reglas de `05-arquitectura-ux.md` §4.2 (±1 semana, solo días libres, no borrar).
- Todo estado se distingue **sin depender del color** (icono + etiqueta).
- El `weekly_schedule` de un usuario existente aparece correctamente en el calendario.
- Funciona sin conexión contra la caché local.

---

## Fase 5 — Running

Tipos de sesión, plan por objetivo, registro manual.

**Archivos:** migración de columnas de cardio (`06-modelo-datos.md` §B), `types/index.ts`, nuevas `pages/RunLogger.tsx` y `components/run/*`, `lib/templateGenerator.ts` (planes por distancia objetivo), `services/workoutSessions.ts`, y **`complete_workout()` con rama de cardio**.

**Riesgos:**
- **La fórmula de XP para carrera es una decisión de producto sin resolver** (`06-modelo-datos.md` §H). XP por km premia al que corre lejos; por minuto, al que corre despacio; por esfuerzo percibido, es falseable. Mi recomendación es por minuto en movimiento con modificador por tipo, pero **hay que decidirlo antes de escribir la función**, porque cambiarlo después desbalancea a quien ya haya acumulado XP.
- Los topes anti-abuso existentes (1500/sesión, 3000/día) deben aplicarse igual a carrera, o se abre un camino para inflar XP.
- Generar un plan de carrera con progresión sensata no es trivial: la regla del 10% semanal es el mínimo defendible **[estimado]**.

**Criterios de aceptación:**
- Registrar una carrera manualmente en ≤4 interacciones.
- El ritmo se calcula en vivo y nunca se guarda.
- Una carrera da XP por `complete_workout()`, nunca por cliente.
- Los topes se aplican igual que en fuerza.
- Un plan de 10k en 12 semanas genera sesiones coherentes con al menos una tirada larga semanal.

---

## Fase 6 — Gamificación

Racha semanal, badges de running, puntos de una sola vez, gamificación al servidor.

**Archivos:** `services/xp.ts` (`computeNewStreak` y `getValidatedStreak`), `lib/badges.ts`, `lib/challenges.ts`, `lib/notifications.ts`, `App.tsx` (lógica de racha en riesgo), migraciones de `earned_badges`, `weekly_challenges` y columnas de racha en `profiles`, `components/progress/*`.

**Riesgos — el más delicado de todo el plan:**
- **Convertir rachas diarias en semanales cambia el número de todo el mundo.** Alguien con 40 días pasa a tener ~6 semanas y va a sentir que le han quitado algo. Hay que decidir si se convierte (dividir entre 7), si se preserva el mayor de los dos, o si se comunica el cambio. **Es una decisión de producto, no técnica.**
- Migrar los badges de `localStorage` a servidor: hay que subir los que ya existan en el dispositivo sin duplicar. La clave primaria compuesta de `earned_badges` protege contra el duplicado, pero **alguien que tenga badges solo en otro dispositivo los pierde** si no abre la app desde él.
- `notifyStreakAtRisk()` avisa a diario hoy; con racha semanal debe avisar solo cerca del cierre de semana, o se convierte en spam.

**Criterios de aceptación:**
- La racha cuenta semanas consecutivas con ≥1 sesión, desde el lunes.
- Un usuario existente no pierde badges al migrar.
- Las carreras cuentan para racha, retos y badges.
- Ningún dato de gamificación se puede alterar desde el cliente.
- Los tests de `lib/badges.test.ts` y `services/xp.test.ts` cubren los casos nuevos.

---

## Fase 7 — Integraciones (solo Strava)

**Archivos:** nueva Edge Function de Supabase (OAuth + webhook), migración de `strava_connections` + columnas `source`/`external_id` + índice único parcial (`06-modelo-datos.md` §F), nuevo `services/strava.ts`, `pages/Settings.tsx`, ruta de callback (**depende de la Fase 0**).

**Riesgos:**
- **Los tokens en claro.** La decisión entre RLS de solo-servicio y Supabase Vault sigue pendiente (`06-modelo-datos.md` §F). Lo que no es aceptable es un `SELECT` abierto al cliente: un XSS se llevaría los tokens de Strava del usuario.
- **Los límites son por aplicación, no por usuario**: 1.000 lecturas diarias compartidas entre toda la base (`03-integraciones.md` §1). Polling por usuario no escala. Webhooks obligatorios.
- El webhook debe responder en **menos de 2 segundos**, así que hay que encolar y procesar aparte.
- **Los datos de Strava de un usuario solo se le muestran a él.** Los retos sociales no pueden alimentarse de datos importados.
- El refresh token **puede cambiar en cada renovación** y hay que persistirlo siempre.

**Criterios de aceptación:**
- El `client_secret` no aparece nunca en el bundle del cliente (verificable con `grep` sobre `dist/`).
- Importar la misma actividad dos veces no crea duplicados ni paga XP dos veces.
- El webhook responde en <2 s.
- Desconectar Strava borra los tokens.
- Ningún ranking muestra datos procedentes de Strava.

---

## Resumen de riesgos por gravedad

| Riesgo | Fase | Por qué duele |
|---|---|---|
| Tokens de Strava expuestos al cliente | 7 | Un XSS compromete la cuenta de Strava del usuario |
| Migración de `weekly_schedule` a fechas | 4 | Se puede perder el plan de un usuario |
| Conversión de rachas diarias a semanales | 6 | Todo el mundo ve bajar su número; percepción de castigo |
| Fórmula de XP de carrera sin decidir | 5 | Cambiarla después desbalancea a quien ya acumuló |
| Badges de `localStorage` a servidor | 6 | Pérdida silenciosa si el usuario tenía badges en otro dispositivo |
| Rutas reales como cambio transversal | 0 | Toca las 16 páginas a la vez |
| Arrastrar en móvil compitiendo con el scroll | 4 | Si sale mal, la función principal del calendario es frustrante |

---

## Orden recomendado y la desviación que propongo

El orden pedido es: tokens → shell → onboarding → calendario → running → gamificación → integraciones.

**Dos ajustes que recomiendo, y el motivo:**

1. **Fase 0 (rutas) antes que todo.** No es opcional: la Fase 7 no funciona sin ella y la Fase 2 la necesita para el botón atrás.
2. **Running (5) antes que onboarding (3).** El onboarding tiene que poder generar un plan de carrera, y ese generador nace en la Fase 5. Haciéndolo al revés, la Fase 3 se entrega a medias y hay que volver.

Queda así: **0 → 1 → 2 → 4 → 5 → 3 → 6 → 7**.

Las fases 1 y 2 son independientes de las de datos, así que se pueden entregar y validar antes de tocar Supabase. Es el punto de corte natural si quieres ver resultado pronto.

---

## Decisiones aprobadas (23-09-2026)

Registradas aquí para que no se pierdan entre fases. Las tres primeras estaban pendientes de aprobación en el resumen; las dos últimas las añadió Miguel.

1. **Marca: violeta eléctrico.** Aprobado. Implementado en la Fase 1 (tokens). El nombre aprobado aquí era "Cadencia", pero el 28-09-2026 Miguel pidió otro que uniera running + pesas/hipertrofia y se decidió **"Hybrid"** — ya aplicado a `index.html`, el manifest de la PWA, `Login.tsx`, `Signup.tsx`, `Layout.tsx`, notificaciones, `og-image.svg`, `README.md`, `CLAUDE.md`, `metadata.json` y agentes de `.claude/`. Las claves de `localStorage` (`fitgame_*`, `fitgame-theme`) **no** se tocaron: renombrarlas migra/borra datos de usuario existente, así que sigue pendiente como su propia fase si algún día se quiere.
2. **Racha diaria → semanal.** Aprobado. Fase 6. Queda por decidir la política de conversión para quien ya tiene racha (dividir entre 7, preservar el mayor, o comunicar el cambio); es lo que decide si el usuario siente que le han quitado algo.
3. **Solo Strava en el MVP.** Aprobado. Fase 7. Apple Health y Health Connect quedan fuera por ser inalcanzables desde una PWA (`03-integraciones.md`).
4. **XP de carrera por cumplimiento de zonas, no por volumen.** Decidido por Miguel, sustituye a mi recomendación de "por minuto en movimiento con modificador por tipo". El principio: **se premia hacer el entrenamiento que toca, no correr más**.
   - Correr sin plan → **XP base** por sesión (equivalente a la carrera de rodaje normal).
   - Sesión con zonas objetivo (p. ej. 20 min en Z2) → XP proporcional al **tiempo dentro de la zona pedida**. Salirse no resta por debajo del base: simplemente no suma el extra.
   - Sesión con estructura (p. ej. km 1 en Z2, km 2 en Z3) → **bono de ejecución** si se cumple la progresión propuesta.
   - Los topes anti-abuso existentes (1500 XP/sesión, 3000 XP/día) se aplican igual.
   - **Bloqueante técnico a resolver antes de escribir la fórmula:** el tiempo en zona necesita frecuencia cardíaca o, en su defecto, ritmo. El registro manual de la Fase 5 no da ninguna de las dos por muestra. O la zona se infiere del ritmo medio por tramo, o esta fórmula solo funciona con datos importados de Strava (Fase 7). Hay que decidirlo al planificar la Fase 5.
5. **El onboarding va antes que el running.** Decidido por Miguel, con el precedente de Runna y RunnerPro: el onboarding es lo primero que ve el usuario. **Rechaza mi propuesta de reordenar (5 antes que 3).** Se mantiene el orden pedido: **0 → 1 → 2 → 3 → 4 → 5 → 6 → 7**.
   - Consecuencia que sigue en pie: en la Fase 3, elegir "solo carrera" tiene que producir *algo* válido, y el generador de planes de carrera nace en la Fase 5. La Fase 3 entrega un plan de carrera mínimo (progresión del 10% semanal, una tirada larga) y la Fase 5 lo sustituye por el generador completo.
