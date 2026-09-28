# 01 · Referencias de vídeo — análisis forense

Análisis de 5 screen-recordings de apps de running/fitness, hecho a partir de fotogramas extraídos con ffmpeg (detección de escena + muestreo cada 6 s, escalados a 900 px de alto).

Todos los datos concretos (HEX, nº de pasos, etiquetas de navegación) están respaldados por la ruta del fotograma correspondiente. Los HEX proceden de muestreo de píxel sobre JPEG comprimido, así que **todos son aproximados** y van marcados como `[estimado]` salvo indicación contraria.

---

## 1. Tabla de vídeos

| Slug | Fichero original | Duración | Resolución | App identificada | Confianza |
|---|---|---|---|---|---|
| `v1` | `Screenrecorder-2026-09-23-10-13-20-131.mp4` | 222,96 s | 1220×2712 (≈9:20, Android) | **Strava** (con tarjetas de entrenamiento de marca **Runna** embebidas) | Alta — logo Strava legible en `v1/sec_013.jpg`; wordmark Runna en `v1/sec_001.jpg` |
| `v2` | `Screenrecorder-2026-09-23-16-28-29-438.mp4` | 280,13 s | 1220×2712 | **Runna** (onboarding + alta de plan + paywall) | Alta — nombre en pantalla en `v2/sec_029.jpg`; ficha de Google Play "Runna: Running Plans & Coach" en `v2/sec_037.jpg` |
| `v3` | `Screenrecorder-2026-09-23-16-35-20-540.mp4` | 211,86 s | 1220×2712 | **Runna** (app ya logueada: Hoy / Plan / Calendario / Progreso) | Alta — sección "RUNNA" en ajustes, `v3/sec_030.jpg` |
| `v4` | `Screenrecorder-2026-09-23-16-39-21-400.mp4` | 180,74 s | 1220×2712 | **RunnerPro** (landing + onboarding, ejecutándose en navegador móvil) | Alta — wordmark `RUNNERPRO` en `v4/sec_002.jpg`; checkout Stripe con "RunnerPro" en `v4/sec_028.jpg`; pestañas de navegador en `v4/sec_030.jpg` |
| `v5` | `Screenrecorder-2026-09-23-16-43-30-126.mp4` | 212,60 s | 1220×2712 | **RunnerPro** (área de cliente: Home / Diario / Progreso / Chat) | Alta — URL `cliente.runnerpro.app` visible en `v5/sec_006.jpg`; versión `v79.5.1` en `v5/sec_020.jpg` |

**Fotogramas extraídos:** v1 = 38 · v2 = 59 · v3 = 56 · v4 = 36 · v5 = 52 (total 241).
Prefijo `scene_` = corte por cambio de escena; prefijo `sec_` = muestreo cada 6 s.

> Corrección a la hipótesis de partida: el material **no** es sólo Runna + RunnerPro. `v1` es mayoritariamente **Strava**, que desde la adquisición de Runna sirve tarjetas de entrenamiento con marca Runna dentro de su propio flujo. Eso hace de `v1` una referencia útil precisamente porque muestra **dos sistemas de diseño conviviendo en la misma pantalla**.

---

## 2. Strava (`v1`)

App nativa Android, tema oscuro, español.

### 2.1 Feed / Inicio

- **Layout** (`v1/sec_013.jpg`): barra superior con wordmark a la izquierda y 4 iconos de acción a la derecha (añadir, mensajes, buscar, notificaciones). Debajo, feed vertical infinito de tarjetas de actividad. Cada tarjeta = mapa a sangre completa (full-bleed, sin márgenes laterales) → bloque de contenido con padding lateral ≈16 px.
- **Anatomía de la tarjeta de actividad** (`v1/sec_013.jpg`), de arriba abajo:
  1. Mapa de la ruta con traza naranja sobre cartografía gris/verde apagada.
  2. Avatar circular + nombre + metadatos secundarios (fuente/fecha/hora) + ubicación con icono.
  3. Título de la actividad en peso alto, tamaño ≈20 px.
  4. Fila de 3 métricas con etiqueta pequeña encima y valor grande debajo (Distancia / Ritmo / Logros).
  5. Sub-tarjeta destacada con fondo ligeramente más claro para el logro (icono medalla + texto).
  6. Chip de etiqueta con icono (tipo de sesión).
  7. Fila de 3 acciones sociales lineales (kudos / comentar / compartir), alineadas a la izquierda y repartidas.
  Una línea vertical fina a la izquierda encadena las tarjetas como un *timeline*.
- **Densidad**: media-alta. Mucha información por tarjeta pero separada por generosos aires verticales.
- **Navegación**: tab bar inferior de **5 elementos** (`v1/sec_013.jpg`): Inicio, Mapas, **Registrar** (botón central destacado con círculo relleno), Grupos, Tú. El tab central rompe el patrón con un icono circular de mayor peso — es la acción primaria, no una pestaña más.

### 2.2 Detalle de actividad

- **Layout** (`v1/sec_020.jpg`, `v1/sec_023.jpg`, `v1/sec_026.jpg`): scroll largo dividido en **bloques autónomos separados por el color de fondo** — bandas casi negras alternando con bandas gris muy oscuro. Cada bloque = un tema (gráfico de ritmo, Parciales, Ritmo, Información de ritmo cardiaco, Cadencia, Desnivel).
- **Cabecera contextual** persistente: chevron de colapso + tipo de actividad + guardar (bookmark) + menú kebab.
- **Componentes**:
  - Gráfico de barras apiladas con eje Y invertido (ritmo: menor = mejor) y línea discontinua de media (`v1/sec_020.jpg`).
  - Tabla "Parciales": fila por kilómetro con barra horizontal proporcional inline — micrográfico dentro de la tabla, sin gráfico aparte (`v1/sec_020.jpg`).
  - Gráfico de área para ritmo y cadencia con relleno translúcido (`v1/sec_020.jpg`, `v1/sec_023.jpg`).
  - **Tarjeta de insight de IA** ("Athlete Intelligence"): borde fino gris, esquinas ≈12 px, icono + etiqueta en cabecera, párrafo explicativo (`v1/sec_023.jpg`). Es el patrón que convierte números en frase.
  - **Estado vacío monetizado**: cuando falta un sensor, el bloque muestra ilustración lineal + explicación + enlace de acción en color acento, en vez de ocultarse (`v1/sec_023.jpg`).
  - Menú contextual del kebab: hoja gris claro con 7 acciones de texto plano, sin iconos (`v1/sec_026.jpg`).
- **Enlaces de acción**: texto en naranja acento, sin subrayado ni botón, alineados a la derecha bajo cada bloque (`v1/sec_020.jpg`, `v1/sec_023.jpg`).

### 2.3 Entrenamientos instantáneos (tarjetas Runna dentro de Strava)

- **Layout** (`v1/sec_001.jpg`, `v1/sec_010.jpg`): cabecera con back + título truncado con elipsis + info (i). Debajo, **selector de 4 modos** como círculos de 56 px con icono lineal centrado y etiqueta debajo; el activo se rellena de color. Debajo, banda explicativa con icono de megáfono. Debajo, **carrusel de tarjetas apiladas** (efecto baraja: las tarjetas traseras asoman por los lados). Pie fijo con nota informativa.
- **Cambio de color por modo** — patrón fuerte: toda la paleta de la pantalla cambia según el modo seleccionado.
  - "Más fácil" → teal (`v1/sec_001.jpg`)
  - "Más difícil" → naranja (`v1/sec_006.jpg`)
  - "Variedad" → verde lima (`v1/sec_010.jpg`)
- **Tarjeta de entrenamiento**: esquinas muy redondeadas (≈20 px), degradado diagonal sutil, ilustración lineal de zapatilla/agua en esquina superior derecha, par de métricas arriba (etiqueta pequeña + valor grande), wordmark de la marca, título a 2-3 líneas en peso alto, descripción truncada con elipsis. Indicadores de paginación (4 puntos) bajo el carrusel.
- **Gesto**: swipe horizontal sobre la baraja.

### 2.4 Detalle de entrenamiento sugerido

- **Layout** (`v1/sec_004.jpg`, `v1/sec_012.jpg`): *hero* de color/imagen a sangre con back y (i) flotando en círculos translúcidos; chip de categoría; título grande. Debajo, franja de marca. Debajo, fila de 3 métricas. Tarjeta de insight de IA. Pie con 2 botones apilados.
- **Botones**: primario píldora completa rellena en naranja (`#EB4604` [estimado], `v1/sec_004.jpg`), secundario píldora de sólo borde en el mismo naranja con texto naranja. Debajo, disclaimer legal en gris pequeño.
- **Estructura de sesión** (`v1/sec_007.jpg`): lista numerada con **círculos numerados unidos por una línea vertical continua** (timeline). Encabezados de sección en peso alto ("Repetir 2x", "Enfriamiento"). El paso de repetición usa un icono de bucle en vez de número. Cada fila = una frase corta con la instrucción y el objetivo de ritmo.

### 2.5 Predicciones de rendimiento

- **Layout** (`v1/sec_016.jpg`): rejilla 2×2 de predicciones. Cada celda = badge hexagonal/estrellado con la distancia dentro, tiempo estimado en cifras muy grandes, ritmo debajo, y **chip de delta** con triángulo (mejora/empeora).
- **Estado sin datos**: guiones dobles `--` + texto "N carreras restantes" — comunica el progreso hacia el desbloqueo en vez de dejar el hueco vacío.
- **Selector temporal**: segmented control de 4 opciones (Hoy / 1M / 3M / 6M) en píldora oscura, el activo relleno en gris claro con check (`v1/sec_016.jpg`).
- **Cross-sell**: tarjeta de borde teal (color de la marca invitada, no el naranja de la casa) con título, subtítulo y chevron (`v1/sec_016.jpg`).

### 2.6 Zonas de entrenamiento

- **Layout** (`v1/sec_030.jpg`): fila de chips-filtro con scroll horizontal, de sólo borde en naranja con chevron cuando son desplegables. Debajo, 5 filas Z5→Z1 (descendente) con etiqueta de zona, **barra horizontal proporcional**, tiempo y rango de ppm a la derecha.
- **Codificación de color**: gradiente de rojo saturado (Z5) a rosa pálido (Z1) — misma familia cromática, no 5 colores distintos.
- **Tooltip de descubrimiento**: bocadillo blanco con pico apuntando al elemento, para explicar una interacción no obvia (`v1/sec_030.jpg`).
- **Selector de rango**: píldoras horizontales de texto (7D/1M/3M/6M/AAA/1A), activa rellena en naranja. Debajo, botón ancho de borde para rango personalizado.

### 2.7 Esfuerzo relativo (métrica semanal)

- **Layout** (`v1/scene_001.jpg`): pantalla de **color saturado a sangre completa** (morado) para una sola métrica. Rango de fechas pequeño → número enorme (≈64 px) con (i) al lado → titular cualitativo → párrafo de interpretación. Debajo, iniciales de días L-M-M-J-V-S-D como base del gráfico. Pie con affordance de swipe ("Desliza para ver las semanas anteriores") flanqueado por chevrons.
- **Panel inferior**: gráfico histórico en negro que se puede colapsar con chevron.
- **Banda de suscripción**: barra fina sobre el hero con "Vista previa para suscriptores · Quedan N días" — contador de urgencia integrado, no un modal.

### 2.8 Paywall

- **Layout** (`v1/sec_036.jpg`): scroll largo agrupado por **secciones temáticas de beneficio** ("Competir", "Los suscriptores también tienen acceso a…"). Cada beneficio = fila con icono cuadrado de 40 px con arte propio + título en peso alto + descripción de 1-2 líneas + chevron. CTA píldora naranja fijo al pie.
- Una fila destacada puede llevar **×** para descartarse, mezclando promo y utilidad.

### 2.9 Estados de carga y error

- **Skeleton screens** (`v1/sec_033.jpg`): bloques grises con la forma real del contenido futuro, no spinner.
- **Error**: toast/snackbar claro anclado abajo, texto en 2 líneas, sin botón de acción (`v1/sec_033.jpg`).
- **Tabs de contenido**: subrayado naranja bajo el tab activo, tipografía del inactivo en gris (`v1/sec_033.jpg`).

### 2.10 Tipografía, color, iconografía y copy — Strava

- **Tipografía** [estimado]: sans grotesca condensada de marca para el wordmark; para UI, sans neogrotesca (tipo Inter/Roboto) con 2 pesos dominantes: Bold para títulos, valores y encabezados de bloque; Regular para cuerpo. Jerarquía por **tamaño extremo** (valor de métrica ≈32-64 px frente a etiqueta ≈11 px), no por color.
- **Colores** (muestreo, todos `[estimado]`):
  | Rol | HEX | Frame |
  |---|---|---|
  | Fondo base | `#141414` | `v1/sec_004.jpg` |
  | Fondo tab bar | `#131512` | `v1/sec_013.jpg` |
  | Superficie elevada / tab activo | `#262823` | `v1/sec_013.jpg` |
  | Acento primario (naranja) | `#EB4604` | `v1/sec_004.jpg` |
  | Acento secundario (naranja oscuro badge) | `#BC3600` | `v1/sec_016.jpg` |
  | Datos — serie principal | `#3A82D4` | `v1/sec_020.jpg` |
  | Datos — serie atenuada | `#6788AB` | `v1/sec_020.jpg` |
  | Hero contextual (Esfuerzo relativo) | morado saturado, `#331642`→ rango claro | `v1/scene_001.jpg`, `v1/sec_004.jpg` |
- **Iconografía**: lineal, grosor ≈2 px, esquinas redondeadas, tamaño consistente 24 px. Excepción: los logros y los iconos de las filas del paywall son **ilustraciones rellenas y multicolor**, deliberadamente distintas del set de UI.
- **Copy y tono**: segunda persona, tuteo. Títulos nominales cortos (2-4 palabras). Los insights de IA son 1-2 frases descriptivas + una recomendación; empiezan con el dato y terminan con la acción. Los enlaces de acción son verbos en imperativo de 3-6 palabras. Disclaimers legales en frase completa, gris, tamaño mínimo.

---

## 3. Runna (`v2` onboarding · `v3` app)

App nativa, tema oscuro azulado (no negro puro), español.

### 3.1 Onboarding — estructura general

- **Chrome persistente** (`v2/sec_001.jpg`): back (`<`) a la izquierda, **barra de progreso centrada y estrecha** (≈32 % del ancho, no a todo lo ancho), y **×** de salida a la derecha. La barra crece a lo largo del flujo (`v2/sec_017.jpg` ≈40 %, `v2/sec_021.jpg` ≈95 %).
- **Plantilla de paso**: pregunta como titular grande (2 líneas máx.) → subtítulo explicativo gris → lista de opciones → CTA "Continuar" **fijo al pie**, píldora blanca con texto negro, ancho completo menos márgenes.
- **CTA deshabilitado**: mismo tamaño y posición, relleno gris oscuro y texto gris — nunca desaparece ni cambia de sitio (`v2/sec_015.jpg`).

### 3.2 Onboarding — pasos observados

Pasos identificados en los fotogramas (el flujo completo no es totalmente enumerable porque el muestreo es cada 6 s, así que el total exacto es `[estimado]` en **~12-15 pasos**):

| # | Pregunta | Tipo de input | Frame |
|---|---|---|---|
| 1 | Objetivo principal | Lista de 10+ opciones, selección única, cada una con emoji/icono ilustrado | `v2/sec_001.jpg`, `v2/sec_005.jpg` |
| 2 | (Rama) Buscar tu carrera | Buscador + 4 chips-filtro con scroll horizontal + lista de eventos con imagen | `v2/sec_003.jpg` |
| 3 | (Rama) Explorar todos los planes | Catálogo por categorías con carruseles horizontales | `v2/sec_009.jpg`, `v2/sec_011.jpg`, `v2/sec_013.jpg` |
| 4 | Historial de lesiones | 4 opciones, selección única, con disclaimer médico y de privacidad encima | `v2/sec_015.jpg` |
| 5 | Nivel de actividad actual | 4 opciones, selección única con checkbox cuadrado redondeado a la derecha | `v2/sec_017.jpg` |
| 6 | Días disponibles para correr | **Selección múltiple** (7 filas), con regla de validación en línea ("Selecciona al menos 3 días para continuar", en verde) | `v2/sec_019.jpg` |
| 7 | Duración del plan | 3 fichas con fecha + nº de semanas; la recomendada lleva borde menta, justificación y **badge de aval del entrenador con avatar**. Escapes: duración personalizada / fecha de fin personalizada | `v2/sec_021.jpg` |
| 8 | Día de fin del plan | 7 filas día + fecha, selección única, borde menta en la elegida | `v2/sec_023.jpg`, `v2/sec_025.jpg`, `v2/sec_027.jpg` |
| 9 | Paywall | Ver §3.3 | `v2/sec_029.jpg` |

Tras el pago, el flujo continúa con **educación previa al plan** (`v3/sec_001.jpg`, `v3/sec_003.jpg`):
- "Cómo sacar el máximo partido a tu plan": 4 filas con icono + etiqueta + chevron (Reorganizar carreras / Omitir entrenamientos / Ajustar dificultad / Ritmo conversacional). Nota de pie: dónde volver a encontrarlo.
- "Guía para el plan": lista de tipos de carrera del plan con **cuadrado de color** como leyenda — el color que después se usará en el calendario.

### 3.3 Paywall Runna

- **Layout** (`v2/sec_029.jpg`, `v2/sec_033.jpg`): × arriba a la derecha → icono circular de corona con borde degradado → titular con el nombre de marca → subtítulo **personalizado con el nombre del usuario** → lista de 4 beneficios con check verde circular → 2 fichas de precio → CTA menta → botón secundario de sólo borde ("código de referencia") → disclaimer de 2 líneas.
- **Fichas de precio**: la anual va seleccionada por defecto con borde menta y **badge "AHORRA UN 48 %"** en pastilla menta anclada a la esquina superior derecha. Cada ficha muestra el precio del periodo a la izquierda y el **precio normalizado por semana a la derecha** — comparador implícito sin tabla.
- **Timeline de la prueba gratuita** (`v2/sec_033.jpg`): línea vertical de 3 hitos (hecho / hoy / futuro) con iconos circulares y **gradiente de color a lo largo de la línea** (rojo→verde). El hito completado va tachado. Convierte "cómo funciona la prueba" en algo visual.

### 3.4 Pantalla Hoy (`v3/sec_005.jpg`, `v3/sec_012.jpg`)

- **Layout**: cabecera con avatar circular a la izquierda, **selector central de semana** ("Semana 1/10 ▾") acompañado de un anillo de progreso, y campana a la derecha. Debajo, **tira de calendario semanal** con iniciales L-M-M-J-V-S-D + número de día; el día actual va en círculo blanco relleno; los días con sesión llevan un **punto de color** debajo (verde = planificada, gris = completada). Handle de arrastre para expandir a mes.
- **Cuerpo scrolleable** dividido en secciones con encabezado + acción textual a la derecha ("EXPANDIR ›", "CONTRAER ⌄").
  - **"Mis datos"**: rejilla 2 columnas. Tarjeta de nivel (badge hexagonal 3D + badge "Nuevo" + barra de progreso fina + "N puntos para \<siguiente nivel\>") junto a tarjeta de meteorología (fondo azul grisáceo, temperatura enorme, orto/ocaso y lluvia en una fila de micro-métricas).
  - **"Añadir carrera"**: rejilla 2×N de **chips de tipo de sesión**, cada uno con degradado propio, icono de corredor arriba a la izquierda, etiqueta abajo a la izquierda y una silueta de corredor grande y translúcida a la derecha como marca de agua.
  - **Estado de plan pendiente** (`v3/sec_012.jpg`): ilustración de sello/medalla, titular con el nombre del usuario, párrafo explicativo. Encima, **carrusel de tarjetas promocionales descartables** (×) con puntos de paginación.
- **CTA flotante**: píldora clara "▶ Registrar entrenamiento" anclada justo encima de la tab bar, con sombra — flota sobre el contenido, no ocupa sitio en el layout.
- **Navegación**: tab bar de **5 elementos** con icono lineal + etiqueta (`v3/sec_005.jpg`): Hoy, Plan, Calendario, Progreso, Soporte. Sin FAB propio (el CTA flotante hace de FAB pero es ancho y etiquetado).

### 3.5 Pantalla Plan (`v3/sec_007.jpg`)

- **Tarjeta de cabecera de plan**: nombre del plan + escudo/badge del plan a la derecha, fecha de fin, **barra de progreso segmentada** (un segmento por semana — muestra la longitud del compromiso, no sólo el %), contador "0/10" y botón blanco ancho "Gestionar plan".
- **Fila de 3 accesos rápidos**: círculo de borde + icono lineal + etiqueta a 2 líneas (Visión general del plan / Apps conectadas / Tus planes).
- **Lista de semanas**: una tarjeta por semana con rango de fechas, "Semana N", barra de progreso de 2 segmentos, total de entrenamientos y **lista de sesiones con cuadrado de color + día abreviado + tipo**. La semana actual va resaltada con borde blanco.

### 3.6 Calendario (`v3/sec_009.jpg`)

- **Vista**: **agenda vertical continua por semanas**, no rejilla de mes. Cada semana abre con una banda de cabecera (rango de fechas + chip "SEMANA N" + total de km).
- **Fila de día**: columna izquierda estrecha con día abreviado + número (el día actual en círculo blanco), y a la derecha la sesión o un affordance **"+ Añadir"** cuando está vacío. Nunca hay huecos muertos: todo día vacío es un punto de entrada.
- **Estados de sesión**:
  - Completada → tarjeta gris con **barra vertical gris** a la izquierda, título, métricas reales y **check circular blanco** a la derecha (`v3/sec_009.jpg`).
  - Planificada → tarjeta gris con **barra vertical verde** (`#73D75D` [estimado], `v3/sec_009.jpg`), título y duración prevista, sin check.
  - Descanso → sólo texto gris "Día de descanso", sin tarjeta.
  - Un día puede tener sesión **y** "+ Añadir" a la vez.
- La semana actual se delimita con un **recuadro de borde blanco** alrededor de todo el bloque.

### 3.7 Progreso (`v3/sec_010.jpg`)

- Cabecera con avatar + título + "+" + campana. **Dos tabs con subrayado** (Entrenamientos / Rendimiento).
- Fila de 3 **chips-filtro desplegables** (Tipo / Año / Mes).
- Cabecera de grupo por mes con total de km a la derecha, y subtítulo con nº de actividades + tiempo total.
- **Tarjeta de actividad**: mini-sparkline de la ruta a la izquierda, título + fecha/hora, fila de 3 métricas (etiqueta pequeña / valor grande) y, tras un separador fino, **badges hexagonales de récords** conseguidos en esa sesión (1K, 1MI).

### 3.8 Detalle de sesión (`v3/sec_033.jpg`)

- **Cabecera** de color (verde) con back, título y acciones (compartir, marcar).
- Fila de **4 acciones secundarias con scroll horizontal**: círculo de borde + icono + etiqueta en mayúsculas a 2 líneas (Estiramientos / Cargar ruta / Vincular actividad / Saltar entrenamiento).
- **Bloque "Descripción"**: lista de pasos numerados. Cada paso es una tarjeta con **cabecera de color según la fase** (gris = calentamiento/enfriamiento, verde = bloque de trabajo con "Repetición ×3"), número grande a la izquierda, instrucciones a la derecha y **chip de modalidad** (WALK / CARRERA) con icono, alineado a la derecha.
- **Tarjeta de entrenador**: avatar redondo + nombre + credencial en una línea + chevron, seguida de un mensaje motivacional personalizado. Da **cara humana** a un plan algorítmico.
- CTA flotante "▶ Iniciar entrenamiento" + botón circular secundario de música al lado.

### 3.9 Gamificación (`v3/sec_021.jpg`, `v3/sec_024.jpg`, `v3/scene_015.jpg`, `v3/sec_015.jpg`)

Es el sistema más completo de los cinco vídeos:

- **Niveles**: 5+ tiers con **badge hexagonal 3D** y umbral de puntos — Bronce 150, Plata 750, Oro 2.000, Platino 7.000, Diamante 15.000 (`v3/sec_024.jpg`, `v3/scene_015.jpg`). El tier actual se muestra a gran tamaño y en color; los siguientes en fila horizontal, atenuados/desaturados.
- **Progreso**: barra fina del color del tier + texto "N puntos para \<siguiente\>" y total acumulado. La etiqueta prioriza **lo que falta**, no lo conseguido.
- **Catálogo de puntos** con 2 tabs (`v3/scene_015.jpg`): **"Una sola vez"** (acciones de activación: añadir zapatillas 25, conectar dispositivo 25, conectar app 25, configurar plan de fuerza 25…) frente a **"Recurrente"** (completar sesión de fuerza 50, completar carrera del plan 100, completar un plan 1.000 — `v3/sec_021.jpg`). Es una separación explícita entre *onboarding gamificado* y *retención gamificada*.
- **Recompensas reales** (`v3/sec_015.jpg`): pantalla "Ofertas Premium" con fila de badges de tier como tabs, chips de categoría (Ropa / Eventos / Nutrición / Recuperación) y tarjetas de partner. Las ofertas de tiers superiores aparecen **visibles pero con candado** ("🔒 Plata 20 % de descuento") — el bloqueo se muestra, no se oculta.
- **Referidos** (`v3/sec_012.jpg`): tarjeta descartable con ilustración de regalo y recompensa bilateral en euros.
- **Tarjeta "Más ofertas · Próximamente"**: placeholder con el estilo del tier — mantiene el ritmo visual de la rejilla.

### 3.10 Ajustes y zonas (`v3/sec_027.jpg`, `v3/sec_030.jpg`, `v3/sec_018.jpg`)

- **Zonas de RC**: párrafo explicativo → tarjeta con 5 filas, cada una con **barra vertical de color** a la izquierda, nombre de la zona, descripción de una frase, y el umbral en BPM alineado a la derecha **en la línea divisoria** entre zonas (elegante: el número pertenece a la frontera, no a la fila).
- **Ajustes**: agrupados en tarjetas por sección con encabezado en mayúsculas pequeñas. Sección de marca con enlaces de contenido (podcast, labs, calculadora, eventos). Fila de iconos circulares de redes con etiqueta en mayúsculas debajo. Acciones destructivas al final.
- **Icono de app seleccionable** (`v3/sec_018.jpg`): 4 variantes (Por defecto / Oscuro / Claro / Orgullo) como lista de radio con preview real del icono.

### 3.11 Tipografía, color, iconografía y copy — Runna

- **Tipografía** [estimado]: sans geométrica/neogrotesca (tipo Inter o similar), 3 pesos: Bold (titulares, valores, encabezados), Medium (etiquetas, botones), Regular (cuerpo). Titulares de pregunta ≈24 px a 2 líneas; cuerpo ≈14-15 px; etiquetas ≈11-12 px. Uso notable de **cursiva** en algunos titulares de sección.
- **Colores** (muestreo, todos `[estimado]`):
  | Rol | HEX | Frame |
  |---|---|---|
  | Fondo base (azul-negro, no negro puro) | `#171C20` | `v3/sec_005.jpg`, `v2/sec_029.jpg` |
  | Superficie elevada / tarjeta | `#242B33` | `v3/sec_005.jpg` |
  | Acento primario (menta) | `#37DABB` | `v2/sec_029.jpg` |
  | Menta variante badge/borde | `#42DDB3` / `#6CDEBD` | `v2/sec_029.jpg`, `v2/sec_021.jpg` |
  | Menta sutil (texto validación) | `#39B18D` | `v2/sec_019.jpg` |
  | CTA claro (fondo botón) | `#E2E9EF` | `v3/sec_005.jpg` |
  | Sesión planificada (verde) | `#73D75D` | `v3/sec_009.jpg` |
  | Tipo · Carrera fácil | `#82CE23` | `v3/sec_005.jpg` |
  | Tipo · Tempo | `#E1A81B` | `v3/sec_005.jpg` |
  | Tipo · Intervalos | `#D35B27` | `v3/sec_005.jpg` |
  | Tipo · Cuestas | `#508149` | `v3/sec_005.jpg` |
  | Tipo · Carrera larga | morado ≈`#693C9B` | `v3/sec_005.jpg` |
  | Tipo · Evento | `#A22126` | `v3/sec_005.jpg` |
  | Tarjeta meteo | `#799CB0` | `v3/sec_005.jpg` |
  | Tier Bronce | `#9B795E` | `v3/sec_024.jpg` |
- **Iconografía**: set lineal propio, grosor ≈1,5-2 px, muy fino y geométrico, 24 px. En el onboarding conviven con **emoji/ilustraciones a color** como identificador de opción (`v2/sec_001.jpg`) — decisión deliberada: emoji para elegir, línea para navegar.
- **Radios**: tarjetas ≈12-16 px, chips de tipo ≈12 px, botones = píldora completa, badges = hexágono.
- **Copy y tono**: tuteo, cercano, con signos de exclamación e interrogación de apertura correctos en español. Patrón dominante: **pregunta directa como titular** (6-8 palabras) + frase de justificación ("Esto nos ayuda a…") que explica *por qué* se pide el dato. Notas de tranquilidad recurrentes ("Puedes cambiarlo más adelante"). Etiquetas de acción en imperativo de 1-3 palabras. Mensajes del entrenador en primera persona con el nombre del usuario.

---

## 4. RunnerPro (`v4` captación · `v5` área de cliente)

Aplicación web ejecutada en navegador móvil (`v4/sec_030.jpg` muestra el gestor de pestañas; `v5/sec_006.jpg` muestra la URL `cliente.runnerpro.app`). **Soporta tema claro y oscuro**: `v4` y el arranque de `v5` van en oscuro (`v5/sec_002.jpg`), y el resto de `v5` en claro (`v5/sec_024.jpg`) — hay un toggle "Modo Oscuro" en ajustes (`v5/sec_020.jpg`).

### 4.1 Landing / entrada (`v4/sec_002.jpg`)

- **Layout**: fondo casi blanco. Barra de **4 segmentos de progreso tipo *stories*** en el borde superior. Fila de marca (logo + "Descubre" + wordmark). Titular grande de dos tonos: parte en negro y parte en rojo acento, con punto final — el color hace de subrayado semántico.
- **Tarjeta de contexto**: cuadrado redondeado naranja con icono + etiqueta pequeña en mayúsculas ("BLOQUE 2 · SEMANA 1") + título de la fase.
- **Camino serpenteante ("snake path")**: el elemento diferencial. Sesiones como **círculos de 56 px alternando izquierda/derecha** con la etiqueta de día al lado. Separadores de semana como línea horizontal con el rango de fechas centrado. Codificación de estado:
  - Azul relleno = completada
  - Círculo de sólo borde rojo con etiqueta "Hoy" en rojo = sesión de hoy
  - Naranja relleno = próxima
  - Azul muy claro / desvanecido = futura (con **fade-out progresivo** hacia abajo que sugiere continuidad sin cargarla)
- **CTAs apilados**: primario negro relleno, secundario blanco con borde, ambos en **mayúsculas** y radio ≈12 px (no píldora).

### 4.2 Onboarding RunnerPro (`v4/sec_004.jpg` → `v4/sec_026.jpg`)

- **Chrome**: back en botón cuadrado redondeado gris a la izquierda + **barra de progreso lineal a todo el ancho restante**, fill naranja/rojo sobre track gris (`#E23A0D` sobre `#3A3A3A` [estimado], `v4/sec_016.jpg`).
- **Plantilla de paso**: pregunta centrada (a diferencia de Runna, que la alinea a la izquierda) → opciones → CTA "CONTINUAR" en mayúsculas, píldora blanca, fija al pie sobre una barra con borde superior.
- **Transiciones animadas** con desplazamiento lateral y opacidad (`v4/sec_004.jpg` capta un paso a medio camino).
- **Componente de opción**: fila oscura de radio única; la seleccionada se marca con **borde rojo + fondo teñido de rojo muy oscuro + radio relleno rojo** (`#F13800` [estimado], `v4/sec_007.jpg`) — triple refuerzo visual.
- **Feedback inmediato tras elegir**: al seleccionar "5 días" aparece una tarjeta de reacción bajo la opción ("¡Ambicioso! Progresión rápida si gestionas bien la recuperación 🚀", `v4/sec_010.jpg`). Convierte un formulario en conversación.
- **Inputs mixtos**: además de radios, hay **pickers de rueda** para tiempo (hh:mm:ss, `v4/sec_007.jpg`) y peso (`v4/sec_012.jpg`), con la opción central resaltada y las adyacentes desvanecidas.
- **Pasos múltiples en una pantalla**: "¿Cuánto tiempo tienes por sesión?" pide entre semana y fin de semana en la misma vista con subencabezado (`v4/sec_020.jpg`).
- **Pantallas interstitial de puro texto**: una palabra centrada sobre fondo negro ("Recuerda.", `v4/sec_024.jpg`) para marcar ritmo narrativo entre bloques de preguntas.
- **Pasos observados** (nº total no determinable con el muestreo; `[estimado]` en ~15-20): sentimiento actual hacia el running → días/semana disponibles → marca personal reciente + tiempo → peso → lugar de entrenamiento de fuerza → tiempo por sesión (×2) → preocupaciones sobre seguir un plan → email → checkout.
- **Captura de email** (`v4/sec_026.jpg`): un solo campo, texto de confianza debajo ("Respetamos tu privacidad… nada de spam"), CTA "ACCEDER A MI PLAN" — pide el email **al final**, después de haber invertido esfuerzo.
- **Checkout**: pantalla "Cómo Funciona Tu Plan" con timeline vertical de pasos, y **bottom sheet de Stripe** superpuesto con botón Link verde arriba y formulario de tarjeta debajo (`v4/sec_028.jpg`). El fondo se atenúa y se desenfoca ligeramente.

### 4.3 Home del cliente (`v5/sec_032.jpg`, `v5/sec_024.jpg`, `v5/sec_002.jpg`)

- **Layout**: cabecera con logo a la izquierda, acción central "+ Añadir objetivo" y avatar a la derecha. Debajo, **tira semanal** L-M-M-J-V-S-D con el día actual en círculo negro relleno y punto verde bajo los días con actividad; handle de arrastre para expandir. El bloque de cabecera es una **tarjeta blanca con esquinas redondeadas inferiores** que flota sobre el fondo gris.
- **Cuerpo**: pila de tarjetas blancas independientes sobre fondo gris claro, con radio ≈16 px y sombra muy suave.
  - **Tarjeta de bienvenida / estado del plan**: saludo en cursiva con el nombre → fila con avatar del entrenador + su estado → **checklist vertical de 3 pasos** unidos por línea (check verde = hecho, círculo rojo relleno = en curso, círculo vacío = pendiente) → enlace "Escribir a mi entrenador ›".
  - **Tarjeta de validación de carga** ("¿Te cuadra el volumen de esta semana?"): 3 filas de métrica con icono de color, etiqueta + subtexto explicativo a la izquierda y valor a la derecha; debajo, **3 chips de respuesta** (Me parece poco / Me cuadra / Me parece demasiado). Es feedback estructurado, no texto libre.
  - **Tarjeta de activación "Empecemos por aquí"** (`v5/sec_002.jpg`, `v5/sec_009.jpg`): barra segmentada de 4 tramos arriba; el paso activo se expande mostrando número en círculo rojo, título, párrafo, enlace de acción y **una imagen de apoyo**; los demás pasos quedan colapsados a una línea con número en círculo gris. Acordeón de onboarding progresivo dentro del home.
- **Navegación**: tab bar de **4 elementos** en píldora blanca flotante con sombra (Home / Diario / Progreso / Chat) **más un FAB circular separado** a la derecha, del mismo alto. El tab activo se marca con una píldora gris clara de fondo.
- **FAB expandido** (`v5/sec_026.jpg`): al pulsar, el fondo se desenfoca y aparecen **dos columnas de acciones** agrupadas por dominio — nutrición a la izquierda (Foto comida / Escanear código / Ver recetas) y entrenamiento a la derecha (Pilates / Auto-masaje / Clases / Añadir manual). Cada acción = círculo gris con icono lineal + etiqueta debajo; la principal ("Añadir manual") en rojo relleno. El FAB se convierte en **×**.

### 4.4 Diario (`v5/sec_011.jpg`)

- **Layout**: secciones con encabezado en mayúsculas pequeñas y gris (CÓMO TE SIENTES HOY PARA ENTRENAR / CUERPO Y SUEÑO / LIFESTYLE).
- **Escala Likert** de 5 botones cuadrados numerados con etiquetas de anclaje sólo en los extremos ("Muy mal" / "Muy bien").
- **Filas booleanas**: icono cuadrado de color por categoría + etiqueta + **par de botones Sí/No** a la derecha. Registro de alcohol, cafeína tardía, pantallas en cama, cena pesada, dolor, sueño <6 h.
- Arriba, panel de anillos/donut con leyenda de puntos de color (Forma / Carga) y valores numéricos — el resumen precede al input.
- **Decisión clave**: el diario mezcla *readiness* subjetivo con hábitos de estilo de vida, y todo se responde con **un toque por fila**. Fricción mínima para datos que se piden a diario.

### 4.5 Progreso (`v5/sec_034.jpg`, `v5/sec_022.jpg`, `v5/scene_017.jpg`)

- **Vista camino** (`v5/sec_034.jpg`): repite el *snake path* de la landing, ahora como navegación real del plan. Arriba, **3 chips de contador** en fila (racha 🔥 / trofeo 🏆 / medalla 🎖 con su cifra). Debajo, tarjeta de fase de la semana con icono verde. Luego, separador de semana y la secuencia de círculos alternos con etiqueta de día.
- **Bottom sheet de fase** (`v5/scene_017.jpg`): al tocar la tarjeta de semana sube una hoja con handle, etiqueta "Semana N", título de la fase y explicación en prosa de por qué la semana es así.
- **Vista datos** (`v5/sec_022.jpg`): tarjetas de métricas. "Progreso semanal" con chip de disciplina, rango de fechas y 3 métricas; "Ritmo zonas de entrenamiento" como lista de 6 zonas con **punto de color + nombre + rango de ritmo a la derecha** (Z1 Recuperación → Z6 Sprint). 6 zonas, no 5 — y basadas en **ritmo**, no en pulso.

### 4.6 Chat con entrenador (`v5/sec_030.jpg`)

- Cabecera de conversación: back + avatar + nombre + **indicador de disponibilidad** (punto verde + "Disponible").
- **Estado vacío**: avatar grande centrado, nombre + rol, párrafo que explica para qué sirve el canal y **qué escribir**, y una línea de expectativa de servicio ("Responde entre las 8:00 y las 20:00"). Gestiona la expectativa antes del primer mensaje.
- Composer inferior: píldora gris con adjuntar (clip) a la izquierda, placeholder y micrófono a la derecha.

### 4.7 Ajustes (`v5/sec_020.jpg`)

Tarjetas agrupadas: cuenta/progreso/dispositivos → fila de iconos circulares de redes → preferencias (toggle Modo Oscuro, idioma, ayuda) → cerrar sesión → número de versión centrado en gris pequeño.

### 4.8 Tipografía, color, iconografía y copy — RunnerPro

- **Tipografía** [estimado]: sans geométrica de gran altura de x (tipo Poppins / Plus Jakarta / Inter). Dos usos característicos:
  1. **Mayúsculas con tracking abierto** para etiquetas de sección y botones ("CONTINUAR", "BLOQUE 2 · SEMANA 1").
  2. **Cursiva** para titulares cálidos de tarjeta ("*Bienvenido, miguel*", "*Empecemos por aquí*").
  Titulares ≈24-28 px Bold; cuerpo ≈14 px; etiquetas ≈10-11 px en mayúsculas.
- **Colores** (muestreo, todos `[estimado]`):
  | Rol | HEX | Frame |
  |---|---|---|
  | Fondo claro | `#FAFAFA` | `v4/sec_002.jpg`, `v5/sec_034.jpg` |
  | Superficie clara (tarjeta) | `#FFFFFF` | `v5/sec_024.jpg` |
  | Fondo oscuro | `#161815` – `#191B18` | `v5/sec_002.jpg`, `v4/sec_007.jpg` |
  | Superficie oscura | `#1A1A1A` | `v4/sec_007.jpg` |
  | Acento primario (rojo-naranja) | `#F93304` / `#FA3C00` | `v4/sec_002.jpg`, `v5/sec_024.jpg` |
  | Acento en barra de progreso | `#E23A0D` sobre track `#3A3A3A` | `v4/sec_016.jpg` |
  | Acento paso activo (oscuro) | `#D73101` | `v5/sec_002.jpg` |
  | Selección teñida (oscuro) | `#231C14` | `v4/sec_007.jpg` |
  | Sesión completada (azul) | `#4587F7` / `#5895F2` | `v4/sec_002.jpg`, `v5/sec_034.jpg` |
  | Sesión próxima (naranja) | `#F37506` | `v4/sec_002.jpg` |
  | Éxito / completado (verde) | `#1FE039` – `#46E274` | `v5/sec_024.jpg`, `v5/sec_034.jpg` |
  | CTA negro | `#131313` | `v4/sec_002.jpg` |
- **Iconografía**: lineal de trazo fino (≈1,5 px), estilo Lucide/Feather, casi siempre dentro de un **contenedor circular o cuadrado redondeado de color** que aporta la categoría. Los círculos de sesión usan un glifo de onda/pulso (mismo icono para todas, el estado lo da el color). En el onboarding aparecen emoji a color como ilustración de opción (`v4/sec_016.jpg`).
- **Radios**: tarjetas ≈16 px, botones ≈12 px (no píldora, salvo tab bar y FAB), inputs ≈12 px.
- **Copy y tono**: tuteo, muy conversacional, con **primera persona del plural** cuando habla el equipo ("Te avisamos…", "seguimos remando juntos hacia tu objetivo"). Titulares en forma de pregunta directa de 4-8 palabras. Uso frecuente de emoji al final de frase como marcador emocional. Etiquetas de botón en mayúsculas de 1-3 palabras. Micro-copy de tranquilidad en formularios sensibles (privacidad, pago).

---

## 5. Patrones a robar

Decisiones de diseño reutilizables, ordenadas por impacto para un rediseño de FitGame Pro.

1. **Camino serpenteante como vista principal del plan** (`v4/sec_002.jpg`, `v5/sec_034.jpg`). Una secuencia de nodos alternos izquierda/derecha comunica *progresión* mucho mejor que una lista o una rejilla de calendario, y el estado se lee de un vistazo por color de relleno. El desvanecido progresivo hacia el futuro evita que el compromiso restante intimide. Es el patrón más "gamificable" de todo el material.

2. **Separar puntos de "una sola vez" de puntos "recurrentes"** (`v3/scene_015.jpg`, `v3/sec_021.jpg`). Runna gamifica explícitamente el setup (conectar dispositivo, añadir zapatillas: 25 pts) aparte del uso continuado (completar sesión: 100 pts). Es un arma de activación: convierte la configuración aburrida en progreso visible.

3. **Recompensas bloqueadas visibles, no ocultas** (`v3/sec_015.jpg`). Mostrar la oferta del siguiente tier con candado y su valor concreto ("Plata 20 % de descuento") da una razón numérica para subir de nivel. Ocultarla desperdicia la motivación.

4. **Progreso expresado como "lo que falta"** (`v3/sec_024.jpg`: "325 puntos para Plata"; `v3/sec_007.jpg`: barra segmentada 0/10). La etiqueta del objetivo pendiente rinde más que el porcentaje conseguido, y la barra **segmentada por unidad real** (una muesca por semana) informa del tamaño del compromiso.

5. **Feedback inmediato tras cada respuesta del onboarding** (`v4/sec_010.jpg`). Una tarjeta de reacción que aparece bajo la opción elegida convierte el formulario en diálogo y reduce el abandono percibido. Coste de implementación mínimo, efecto grande.

6. **Justificar cada pregunta y ofrecer marcha atrás** (`v2/sec_017.jpg`: "Esto nos ayuda a adaptar tu plan…"; `v2/sec_021.jpg`: "Puedes cambiarlo más adelante en Gestión del plan"). Baja la ansiedad de compromiso en flujos largos. Añadir además **validación en línea con la regla explícita** (`v2/sec_019.jpg`: "Selecciona al menos 3 días para continuar") en vez de deshabilitar el botón sin explicación.

7. **CTA fijo al pie que nunca se mueve ni desaparece** (`v2/sec_015.jpg` vs `v2/sec_017.jpg`). El estado deshabilitado conserva posición, tamaño y etiqueta; sólo cambia el relleno. Elimina el salto de layout y el "¿dónde está el botón?".

8. **Cambiar toda la paleta de la pantalla según el modo seleccionado** (`v1/sec_001.jpg` teal / `v1/sec_006.jpg` naranja / `v1/sec_010.jpg` lima). Refuerzo de estado barato y muy legible, especialmente útil para "intensidad" o "tipo de sesión".

9. **Calendario como agenda continua donde el día vacío es un CTA** (`v3/sec_009.jpg`). "+ Añadir" en cada hueco convierte el planner en herramienta de entrada de datos. El estado de sesión se codifica con **barra vertical de color a la izquierda + check** — patrón barato, escalable y accesible por posición además de por color.

10. **Chips de tipo de sesión con color propio + marca de agua ilustrada** (`v3/sec_005.jpg`). Una rejilla 2×N de creación rápida en la home, con color consistente que luego reaparece en el calendario y en el plan, crea un lenguaje cromático de dominio.

11. **Bloques de datos separados por bandas de fondo alternas** (`v1/sec_020.jpg`, `v1/sec_023.jpg`). En pantallas de análisis muy largas, alternar el color de fondo entre secciones sustituye a los separadores y hace el scroll navegable sin cabeceras fijas.

12. **Micrográficos dentro de la tabla** (`v1/sec_020.jpg`, parciales por km). Una barra proporcional en la propia fila evita un segundo gráfico y hace la tabla escaneable.

13. **Estado vacío que informa del progreso hacia el desbloqueo** (`v1/sec_016.jpg`: `--` + "10 carreras restantes"). Convierte un hueco en objetivo.

14. **Timeline visual de la prueba gratuita** (`v2/sec_033.jpg`): 3 hitos con gradiente de color y el paso completado tachado. Explica el cobro mejor que un párrafo y reduce la percepción de trampa.

15. **Precio normalizado por semana junto al precio del periodo** (`v2/sec_029.jpg`). Comparador implícito sin tabla; el badge de ahorro va anclado a la ficha recomendada.

16. **Dar cara humana al plan algorítmico** (`v3/sec_033.jpg` tarjeta de entrenador con credencial; `v5/sec_030.jpg` chat con disponibilidad y horario de respuesta; `v2/sec_021.jpg` badge "La elección del entrenador Ben para ti"). Un avatar con nombre y credencial sube la autoridad percibida de una recomendación generada.

17. **Validación de carga con respuesta estructurada** (`v5/sec_024.jpg`: "¿Te cuadra el volumen de esta semana?" + 3 chips). Recoge feedback accionable sin texto libre y hace sentir el plan negociable.

18. **Diario de un toque por fila** (`v5/sec_011.jpg`). Likert de 5 + pares Sí/No con icono de color. Para datos diarios, cada pregunta debe costar exactamente un tap.

19. **FAB que se despliega en acciones agrupadas por dominio** (`v5/sec_026.jpg`), con el fondo desenfocado y la acción principal en color. Escala a muchas acciones sin menú ni pantalla intermedia.

20. **Acordeón de activación dentro de la home** (`v5/sec_002.jpg`, `v5/sec_009.jpg`). Checklist de 4 pasos donde sólo el activo se expande (con imagen de apoyo) y el resto son líneas colapsadas. Onboarding progresivo que no bloquea el uso de la app.

21. **Tab bar flotante en píldora + FAB separado** (`v5/sec_034.jpg`) frente a la barra clásica a sangre. Aligera visualmente y libera el FAB de competir con las pestañas.

22. **CTA de acción principal flotando sobre el contenido** (`v3/sec_005.jpg`, `v3/sec_033.jpg`): píldora ancha y etiquetada justo encima de la tab bar. Combina la visibilidad del FAB con la claridad de un botón con texto.

23. **Doble sistema de iconos deliberado**: lineal y monocromo para navegación y estructura; relleno/ilustrado/emoji para **opciones que el usuario elige** (`v2/sec_001.jpg`, `v3/sec_005.jpg`, `v1/sec_036.jpg`). Diferencia visualmente "moverse por la app" de "decidir algo".

24. **Explicar la interacción no obvia con un tooltip de descubrimiento** (`v1/sec_030.jpg`): bocadillo con pico apuntando al elemento, en vez de un tour modal.

25. **Escritura: pregunta como titular, justificación como subtítulo** (Runna y RunnerPro, ambos). Titular de 4-8 palabras en segunda persona; subtítulo que explica el porqué; etiquetas de acción en imperativo de 1-3 palabras.

26. **Umbral numérico en la línea divisoria entre zonas** (`v3/sec_027.jpg`). Detalle fino: el BPM pertenece a la frontera, no a la fila; elimina la ambigüedad de a qué zona corresponde el número.

---

## 6. Qué NO copiar

- **Ningún logo, wordmark, icono de app ni ilustración de marca** de Strava, Runna o RunnerPro. Los badges hexagonales de Runna llevan el glifo de la marca dentro: el *sistema* de tiers es reutilizable, el *arte* no.
- **Textos literales**. Los copys citados aquí son ejemplos para describir un patrón, no material a reutilizar. Redactar de cero en la voz propia de FitGame Pro.
- **Paletas completas tal cual**. El naranja `#EB4604` de Strava y el menta `#37DABB` de Runna son activos de marca reconocibles. Robar la *estructura* de roles (base oscura azulada + un acento + una familia de colores de dominio) sin el HEX exacto.
- **Nombres de features de marca**: "Athlete Intelligence", "Local Legend", "Esfuerzo Relativo", "Runna Labs", los nombres de tiers tal cual. Los conceptos (insight de IA, métrica de carga semanal, niveles) son genéricos; los nombres no.
- **Títulos truncados con elipsis en la cabecera** (`v1/sec_001.jpg`, `v1/sec_016.jpg`): "Entrenamientos instantán…", "Predicciones de rendi…". Fallo real de diseño — títulos que no caben en la barra. Usar títulos cortos o permitir 2 líneas.
- **Contenido bajo el CTA fijo** (`v1/sec_007.jpg`: una tarjeta promocional queda medio tapada por el botón; `v3/sec_033.jpg`: el mensaje del entrenador queda cortado). Falta padding inferior equivalente al alto del área fija.
- **Disclaimers legales largos en medio de un paso de onboarding** (`v2/sec_015.jpg`): dos párrafos densos antes de las opciones. Necesario, pero debe ir colapsado tras un "¿por qué preguntamos esto?".
- **Mezclar emoji de sistema con iconografía propia sin criterio**. En `v2/sec_001.jpg` conviven emoji de plataforma (🐣, 🌱, ❤️) con iconos de marca; se ve incoherente entre Android e iOS y no escala a modo oscuro. Si se quiere color en las opciones, hacer un set ilustrado propio.
- **Pantallas interstitial de una sola palabra** (`v4/sec_024.jpg`: "Recuerda." sobre negro). Añade pasos al embudo sin aportar información; sólo funciona si el flujo ya está muy optimizado.
- **Escala Likert numérica sin etiquetas intermedias** (`v5/sec_011.jpg`): 1-5 con anclas sólo en los extremos. Ambigua; o se etiquetan todos los puntos o se reduce a 3.
- **Dos sistemas de zonas contradictorios** entre apps: Runna usa 5 zonas de pulso (`v3/sec_027.jpg`), RunnerPro 6 zonas de ritmo (`v5/sec_022.jpg`). Elegir uno y ser consistente en toda la app.
- **Bloques vacíos monetizados como el de "Información de ritmo cardiaco"** (`v1/sec_023.jpg`). Ocupa una sección entera de una pantalla de análisis sólo para vender. Una línea de upsell basta.
- **Fila de acciones con scroll horizontal y texto en mayúsculas a 2 líneas** (`v3/sec_033.jpg`): la cuarta acción queda cortada, sin indicio claro de que se puede deslizar, y el texto en dos líneas es difícil de leer. Usar una rejilla o un menú.
- **Chrome del navegador visible** en el caso de RunnerPro (`v4/sec_030.jpg`, `v5/sec_006.jpg`): la barra de URL y la barra de navegación del sistema roban altura vertical y rompen la ilusión de app. Si FitGame Pro es web, resolverlo con PWA en standalone.

---

## 7. Notas de método y limitaciones

- **Extracción**: `ffmpeg -vf "select='gt(scene,0.3)',showinfo"` (cambio de escena) + `fps=1/6` (muestreo periódico), ambos escalados a 900 px de alto y calidad `-q:v 3`. La detección de escena sola daba entre 1 y 21 fotogramas por vídeo, insuficiente para grabaciones de scroll continuo, de ahí el muestreo complementario.
- **Los HEX** salen de muestreo de píxel/región sobre JPEG comprimido y escalado. Sirven para relaciones y roles, no como valores de token. Confirmar sobre captura sin comprimir antes de tokenizar.
- **No determinado**:
  - El **número exacto de pasos** del onboarding de Runna y de RunnerPro. Con muestreo cada 6 s se pierden pasos rápidos; los totales van marcados `[estimado]` (~12-15 en Runna, ~15-20 en RunnerPro).
  - La **familia tipográfica exacta** de las tres apps: ninguna se nombra en pantalla.
  - Las pantallas de **Soporte** (Runna) y de **detalle de sesión** en RunnerPro, que no llegan a aparecer.
  - La **vista de mes** del calendario de Runna: sólo se ve la tira semanal con el handle de arrastre, nunca expandida.
  - Los **tiers por encima de Diamante** en Runna: la fila horizontal se corta en pantalla (`v3/scene_015.jpg`).
