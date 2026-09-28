# 04 — Sistema de diseño

> Todos los ratios de contraste de este documento están **calculados**, no estimados: fórmula WCAG 2.1 de luminancia relativa, script en `scratchpad/wcag.py`. Lo que es criterio de diseño va marcado **[estimado]**. Parte del sistema actual está en `DESIGN.md`; aquí se indica explícitamente qué se conserva y qué cambia.

---

## 1. Dirección de marca

### El problema del nombre actual

**FitGame Pro** tiene tres problemas concretos:

1. **"Game" promete lo que la app no es.** La gamificación es una capa de motivación sobre un tracker serio; el nombre la pone en el centro y sugiere algo casual, casi infantil, frente a un producto que calcula RPE, periodización en 3 fases y sobrecarga progresiva.
2. **"Pro" no significa nada.** Es el sufijo más gastado del software. No diferencia, y además sugiere que existe una versión gratuita inferior que no existe.
3. **Es monolingüe y ambiguo.** La app está íntegramente en español (badges, copy, onboarding) con un nombre en inglés.

Y a partir de este rediseño hay un cuarto: el nombre no da cabida al **running**, que pasa a ser la mitad del producto.

### Recomendación: **Cadencia**

**Es la única palabra que significa algo preciso en las dos disciplinas a la vez.** En carrera, la cadencia son los pasos por minuto. En fuerza, la cadencia es el tempo del levantamiento (el clásico 3-1-1). Un usuario de cualquiera de los dos mundos la reconoce sin explicación, y es exactamente el puente conceptual que el producto necesita.

Además: es española, se pronuncia igual que se escribe, no necesita sufijo, y su significado de fondo —**ritmo sostenido**— es literalmente lo que mide la gamificación de la app. La racha es cadencia semanal.

**Personalidad de marca: el entrenador competente, no el animador.**

| Es | No es |
|---|---|
| Preciso: da cifras, no adjetivos | Exaltado: nada de "¡BRUTAL!" ni signos dobles |
| Sobrio en la victoria: celebra el dato concreto | Condescendiente: no felicita por abrir la app |
| Directo: segunda persona, frases cortas | Militar: no grita, no culpabiliza por fallar |
| Honesto: si te saltaste tres días, lo dice sin drama | Motivacional vacío: sin citas de gimnasio |

Regla de copy operativa: **si una frase no contiene un dato o una acción, sobra.** "Llevas 12 días" es mejor que "¡Sigue así, campeón!". Y cuando el usuario falla, el tono es de reanudación, no de castigo **[estimado: es la dirección que recomiendo, contrastable con el tono documentado en `01-referencias-video.md` y `02-benchmark.md`]**.

### Tres alternativas

| Nombre | Idea | A favor | En contra |
|---|---|---|---|
| **Kilo** | El kilómetro y el kilogramo comparten prefijo: las dos unidades del producto en una palabra | Conceptualmente el más brillante y el más corto. Memorable, dominio corto | La palabra tiene connotación de narcotráfico en titulares; riesgo de SEO sucio |
| **Racha** | La mecánica que sostiene la retención | Nombra el beneficio real, no la función. Muy español, muy directo | Se queda pequeño si el producto crece más allá de la constancia |
| **Tempo** | El ritmo objetivo en carrera y el tempo del levantamiento | Internacional, suena premium | Menos distintivo: hay software de música y de productividad llamado así |

**Recomiendo Cadencia**, con **Kilo** como segunda opción si se prefiere algo más corto y se acepta el riesgo de connotación. Esta es una de las decisiones que necesito que apruebes.

---

## 2. El cambio de color, y por qué

El sistema actual usa **rojo `#DC2626` como único acento de marca** y, a la vez, rojo para acciones destructivas. El propio `DESIGN.md` lo admite y trata de separarlos: *"Danger (non-brand): red-500/red-600 for destructive actions — distinct from brand primary red"*. Dos rojos casi idénticos, uno significa "hazlo" y el otro "esto borra datos".

**Eso es un fallo de seguridad de la interfaz, no una cuestión de gusto.** El botón que empieza el entrenamiento y el botón que borra la cuenta no pueden compartir color.

### Propuesta: violeta eléctrico de marca, rojo liberado para peligro

El violeta es el único hueco cromático limpio que queda: el verde ya es "completado", el ámbar es "celebración y PR", el azul es "programado", el rojo es "destructivo". Tampoco choca con las referencias del sector (Strava es naranja, Nike es volt, Hevy es azul) **[estimado: comparación de marcas, no medición]**.

**Se conserva del sistema actual:** Inter como única tipografía, la escala de radios, el gradiente radial del fondo, la filosofía de glow tintado, el motion de gamificación (`xp-fly`, `check-pop`, shimmer), el respeto global de `prefers-reduced-motion`, y la escalera de 5 tiers de nivel.

---

## 3. Tokens de color

**Cómo leer las tablas:** cada valor de texto se ha medido contra el fondo sobre el que va a aparecer de verdad. AA exige 4.5:1 para texto normal, 3:1 para texto grande (≥24px, o ≥19px en negrita) y para límites de componentes de interfaz.

### Modo oscuro (por defecto)

| Token | Hex | Uso | Contraste medido |
|---|---|---|---|
| `--bg` | `#0F172A` | Lienzo de la app | — |
| `--surface` | `#1E293B` | Tarjetas, sheets, barra inferior | — |
| `--surface-raised` | `#334155` | Estado elevado, hover, celdas activas | — |
| `--text-primary` | `#F8FAFC` | Texto principal | **17.06:1** sobre `--bg` · AAA |
| `--text-secondary` | `#CBD5E1` | Texto secundario | **12.02:1** sobre `--bg` · **9.85:1** sobre `--surface` · AAA |
| `--text-muted` | `#94A3B8` | Etiquetas, metadatos | **6.96:1** sobre `--bg` · **5.71:1** sobre `--surface` · AA |
| `--primary-fill` | `#A78BFA` | Relleno de CTA, nav activa | **6.56:1** sobre `--bg` · **5.38:1** sobre `--surface` · AA |
| `--primary-ink` | `#0F172A` | Texto **sobre** `--primary-fill` | **6.56:1** sobre el relleno · AA |
| `--primary-text` | `#A78BFA` | Cifras de XP, enlaces, iconos activos | **6.56:1** · AA |
| `--border-input` | `#64748B` | Borde de campos y controles | **3.07:1** sobre `--surface` · AA (límite de componente) |
| `--border-divider` | `#334155` | Separadores decorativos | 1.72:1 — **decorativo, no transmite información** |

> **Por qué el CTA lleva texto oscuro en modo oscuro:** un relleno violeta suficientemente oscuro para que el blanco contraste (4.5:1) se confunde con la tarjeta (`#6D4AFF` sobre `#1E293B` da solo **2.84:1**, por debajo del 3:1 que exige un límite de componente). Con relleno claro y tinta oscura se cumplen las dos cosas a la vez. Es el patrón `on-primary` de Material, y aquí no es preferencia: es la única combinación que pasa ambas pruebas.

#### Semánticos y de estado (modo oscuro)

| Token | Hex | Significado | Contraste sobre `--bg` / `--surface` |
|---|---|---|---|
| `--success` | `#34D399` | Serie hecha, sesión completada | 9.29:1 / 7.61:1 · AAA |
| `--warning` | `#FBBF24` | RPE alto, aviso | 10.69:1 / 8.76:1 · AAA |
| `--danger` | `#F87171` | **Solo destructivo** | 6.45:1 / 5.29:1 · AA |
| `--info` | `#60A5FA` | Programado, futuro | 7.02:1 / 5.75:1 · AA |
| `--celebration` | `#FBBF24` | PR, subida de nivel, badge | 10.69:1 / 8.76:1 · AAA |

#### Tipos de entrenamiento (color del calendario)

Este es el eje nuevo: el calendario unificado necesita distinguir disciplinas de un vistazo.

| Tipo | Hex (oscuro) | Contraste sobre `--bg` / `--surface` |
|---|---|---|
| **Fuerza** | `#FB923C` | 7.89:1 / 6.46:1 · AAA / AA |
| **Carrera** | `#22D3EE` | 9.88:1 / 8.09:1 · AAA |
| **Movilidad** | `#A78BFA` | 6.56:1 / 5.38:1 · AA |
| **Descanso** | `#94A3B8` | 6.96:1 / 5.71:1 · AA |

> **El color nunca va solo.** Cada tipo lleva además icono propio y etiqueta de texto. Un calendario que solo distinga por color es inutilizable para un daltónico, y el deuteranopia confunde precisamente naranja y verde.

### Modo claro

No es un modo de segunda: es lo que se ve en un gimnasio con luz de mediodía y el móvil al 100% de brillo.

| Token | Hex | Contraste medido |
|---|---|---|
| `--bg` | `#F8FAFC` | — |
| `--surface` | `#FFFFFF` | — |
| `--surface-raised` | `#F1F5F9` | — |
| `--text-primary` | `#0F172A` | **17.06:1** sobre `--bg` · AAA |
| `--text-secondary` | `#475569` | **7.24:1** sobre `--bg` · AAA |
| `--text-muted` | `#64748B` | **4.55:1** sobre `--bg` · **4.76:1** sobre `--surface` · AA |
| `--primary-fill` | `#6D4AFF` | **5.15:1** sobre `--surface` · AA |
| `--primary-ink` | `#FFFFFF` | **5.15:1** sobre el relleno · AA |
| `--primary-text` | `#5B3FE0` | **6.50:1** sobre `--surface` · **6.21:1** sobre `--bg` · AA |
| `--border-input` | `#64748B` | **4.76:1** sobre `--surface` · AA |

#### Semánticos y tipos (modo claro)

| Token | Hex | Contraste sobre `--surface` |
|---|---|---|
| `--success` | `#047857` | 5.48:1 · AA |
| `--warning` | `#B45309` | 5.02:1 · AA |
| `--danger` | `#DC2626` | 4.83:1 · AA |
| `--info` | `#2563EB` | 5.17:1 · AA |
| Fuerza | `#C2410C` | 5.18:1 · AA |
| Carrera | `#0E7490` | 5.36:1 · AA |
| Movilidad | `#6D28D9` | 7.10:1 · AAA |
| Descanso | `#475569` | 7.58:1 · AAA |

> **Nota:** el verde de éxito habitual `#059669` da **3.77:1** sobre blanco y **no llega a AA** para texto normal. Por eso el token de claro es `#047857`. Es el tipo de fallo que solo aparece al medir.

### Lo que desaparece en modo claro

El glow tintado es un efecto de modo oscuro; sobre blanco se ve como una mancha sucia. En claro, las sombras son neutras y planas. Esto ya lo dice `DESIGN.md` y se conserva.

---

## 4. Tipografía

**Se conserva Inter** como tipografía única. Es una decisión ya tomada, correcta para interfaz densa de datos, y cambiarla no aportaría nada proporcional al coste.

Una sola adición: **activar las cifras tabulares** (`font-variant-numeric: tabular-nums`) en todo dato numérico — pesos, repeticiones, ritmos, cronómetro, XP. Sin esto, un cronómetro corriendo hace que el layout dé saltitos en cada cifra que cambia de ancho. Es una línea de CSS y se nota en cada sesión.

### Escala de tipo

Escala modular con base 16px y razón 1.25, redondeada a valores enteros usables:

| Token | px | Uso | Peso |
|---|---|---|---|
| `--text-2xs` | 11 | Etiquetas de badge, en mayúsculas | 700 |
| `--text-xs` | 12 | Metadatos, ejes de gráfica | 500 |
| `--text-sm` | 14 | Texto secundario, etiquetas de formulario | 500 |
| `--text-base` | 16 | Cuerpo. **Mínimo absoluto para texto de lectura** | 400-500 |
| `--text-lg` | 20 | Títulos de tarjeta, nombre de ejercicio | 600 |
| `--text-xl` | 25 | Título de pantalla | 700 |
| `--text-2xl` | 31 | Cifra destacada (peso de la serie, ritmo) | 800 |
| `--text-3xl` | 39 | Héroe: cronómetro, XP ganado, distancia | 900 |
| `--text-4xl` | 49 | Solo celebración a pantalla completa | 900 |

**Nunca por debajo de 16px en un campo de entrada.** Safari en iOS hace zoom automático al enfocar un input con tipo menor de 16px, y el usuario se queda con la pantalla desencuadrada a mitad de serie. Es el bug de móvil más frecuente y el más fácil de evitar.

Interlineado: 1.2 para títulos, 1.5 para cuerpo, **1.0 para cifras grandes** (una cifra de 39px con interlineado 1.5 abre un agujero vertical absurdo).

Se conserva de `DESIGN.md`: `font-black` en cifras y títulos héroe; badges siempre en mayúsculas con `tracking-wider`; botones siempre en negrita.

---

## 5. Espaciado

Base **4px**, escala de 4 a 64. Es la que ya usa el proyecto (Tailwind por defecto), así que no hay migración.

| Token | px | Uso |
|---|---|---|
| `--space-1` | 4 | Separación entre icono y su etiqueta |
| `--space-2` | 8 | Interior de chips y badges |
| `--space-3` | 12 | Separación entre elementos relacionados |
| `--space-4` | 16 | **Margen lateral estándar de pantalla** e interior de tarjeta |
| `--space-6` | 24 | Separación entre tarjetas |
| `--space-8` | 32 | Separación entre bloques |
| `--space-12` | 48 | Separación entre secciones |
| `--space-16` | 64 | Respiración superior de pantalla |

Tres reglas no negociables en móvil:

1. **Margen lateral de 16px**, constante en todas las pantallas. Nada pegado al borde.
2. **Objetivo táctil mínimo de 44×44px**, incluso si el icono visible es más pequeño. Ya es convención del proyecto (`CLAUDE.md:224-232`).
3. **Espacio seguro inferior**: la barra de navegación reserva `env(safe-area-inset-bottom)` para no quedar bajo la barra de gestos del iPhone, y las pantallas con scroll acaban con 88px de aire para que el último elemento no quede tapado por la barra.

---

## 6. Radios

Se conserva la escala actual sin cambios: `8 / 12 / 16 / 24 / full`.

| Token | px | Uso |
|---|---|---|
| `--radius-sm` | 8 | Campos, badges, botones pequeños |
| `--radius-md` | 12 | Botones, ítems de navegación, filas de serie |
| `--radius-lg` | 16 | Tarjetas, modales |
| `--radius-xl` | 24 | Tarjeta héroe del día, bottom sheets (solo esquinas superiores) |
| `--radius-full` | 9999 | Avatares, anillos de nivel, chips de icono |

Se mantiene la prohibición del `DESIGN.md`: nada de esquinas a 0px, nada de botones píldora.

---

## 7. Sombras

| Token | Modo oscuro | Modo claro |
|---|---|---|
| `--shadow-card` | Ninguna: la elevación se transmite con la escalera de superficies | `0 1px 3px rgba(15,23,42,.08)` |
| `--shadow-raised` | `0 4px 12px rgba(0,0,0,.4)` | `0 4px 12px rgba(15,23,42,.10)` |
| `--shadow-sheet` | `0 -8px 32px rgba(0,0,0,.5)` | `0 -8px 32px rgba(15,23,42,.12)` |
| `--glow-primary` | `0 0 20px rgba(167,139,250,.35)` | **No se usa** |
| `--glow-celebration` | `0 0 24px rgba(251,191,36,.40)` | **No se usa** |

Se conserva la regla del `DESIGN.md`: **el glow siempre del color del propio elemento**, nunca de un tono ajeno. Y el glow es exclusivo del modo oscuro.

---

## 8. Motion

| Token | Duración | Curva | Uso |
|---|---|---|---|
| `--motion-instant` | 100ms | `ease-out` | Realimentación de pulsación |
| `--motion-fast` | 150ms | `ease-out` | Hover, cambio de estado de chip |
| `--motion-base` | 250ms | `cubic-bezier(.32,.72,0,1)` | Entrada de contenido, cambio de pestaña |
| `--motion-sheet` | 300ms | `cubic-bezier(.32,.72,0,1)` | Bottom sheet arriba/abajo |
| `--motion-celebrate` | 600ms | `cubic-bezier(.34,1.56,.64,1)` | Rebote de PR, subida de nivel |
| `--motion-xp-fly` | 1000ms | `ease-out` | El "+XP" flotante (se conserva) |

La curva `cubic-bezier(.32,.72,0,1)` sale muy rápido y frena largo: es lo que hace que un sheet se sienta "físico" en lugar de "animado" **[estimado: preferencia de diseño, contrastable con lo que se vea en `01-referencias-video.md`]**.

**`prefers-reduced-motion` ya está implementado globalmente** en `index.css` forzando duraciones a 0.01ms. Se conserva tal cual, y cualquier animación nueva debe seguir cubierta por esa regla. Importante: cuando el movimiento se desactiva, la **realimentación no puede desaparecer** — el "+XP" que vuela debe seguir apareciendo, simplemente sin trayectoria.

---

## 9. Inventario de componentes móviles

Estados requeridos en todos: **reposo · pulsado · foco (teclado) · deshabilitado · cargando**, y donde aplique **error** y **vacío**.

### Navegación

| Componente | Descripción | Estados |
|---|---|---|
| **Barra inferior** | 5 destinos, altura 56px + safe-area, iconos de 24px con etiqueta de 11px | activo (icono relleno + `--primary-text` + etiqueta en negrita) · inactivo (contorno + `--text-muted`) · con indicador (punto de aviso) |
| **Cabecera de pantalla** | 48px, título a la izquierda, máximo dos acciones a la derecha | normal · condensada al hacer scroll · con botón atrás |
| **Bottom sheet** | Radio superior 24px, agarradera de 36×4px, altura máxima 90vh | cerrado · parcial · completo · arrastrando |

### Entrada de datos

| Componente | Descripción | Estados |
|---|---|---|
| **Fila de serie** | La pieza más usada de la app: serie, peso, reps, RPE, marca de hecho, todo **editable en línea** | pendiente · en edición (teclado numérico) · completada (fondo verde tenue + marca) · fallada · récord (borde ámbar) |
| **Campo numérico** | Mínimo 16px, teclado `decimal`, con botones de ±. Nunca abrir modal para editar un número | reposo · foco · error · deshabilitado |
| **Selector de RPE** | Escala 1-10 táctil; el rango 7-10 domina el ancho porque es donde se decide | sin valor · seleccionado · arrastrando |
| **Cronómetro de descanso** | Persistente sobre la barra inferior; sigue contando con la app en segundo plano (ya resuelto con `endTime` absoluto) | inactivo · corriendo · a punto de acabar (<10s) · terminado |

### Calendario

| Componente | Descripción | Estados |
|---|---|---|
| **Tira de semana** | 7 días con punto de color por tipo; se desliza horizontalmente | día seleccionado · hoy · con sesión · vacío |
| **Celda de mes** | Cuadrícula compacta, hasta 2 puntos de color por día | planificado · completado · saltado · movido · descanso · hoy |
| **Tarjeta de sesión** | Arrastrable para reprogramar | reposo · arrastrando · soltable · bloqueado (pasado) |

### Gamificación

| Componente | Descripción | Estados |
|---|---|---|
| **Barra de XP** | Con shimmer al ganar (se conserva) | reposo · llenándose · nivel completo |
| **Insignia de nivel** | Escalera de 5 tiers, se conserva del sistema actual | por tier |
| **Contador de racha** | Número + icono | activa · en riesgo (hoy sin entrenar) · congelada · rota |
| **Tarjeta de logro** | Badge desbloqueado | bloqueado (silueta) · recién desbloqueado (animación) · obtenido |

### Realimentación

| Componente | Estados |
|---|---|
| **Toast** | éxito · error · información · deshacer (con acción) |
| **Esqueleto de carga** | uno por tipo de pantalla, ya existen tres |
| **Estado vacío** | ilustración + una línea + acción primaria |
| **Estado sin conexión** | banner persistente + indicador de cola pendiente (ya existe `SyncIndicator`) |

---

## 10. Reglas que no se negocian

1. **El rojo solo significa peligro.** Nunca vuelve a ser el color de un CTA.
2. **El color nunca es el único portador de información.** Icono y texto siempre acompañan.
3. **Ningún objetivo táctil por debajo de 44×44px.**
4. **Ningún campo de entrada por debajo de 16px** (zoom de iOS).
5. **Todo contraste de texto se mide, no se estima.** El script está en el repositorio de trabajo; es reproducible.
6. **El modo claro se diseña, no se deriva.** Un `invert` automático produce el verde `#059669` que ya hemos visto fallar.
7. **`prefers-reduced-motion` reduce el movimiento, nunca la información.**
