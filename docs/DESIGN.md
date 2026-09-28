# Hybrid — Design System

> Gamified fitness tracker. Dark slate canvas, electric-violet accent, RPG-style progression chrome. Extracted from the live codebase (`tailwind.config.js`, `index.css`, `components/ui/*`) — not aspirational, this is what's actually shipped.
>
> **Actualizado en la Fase 1 del rediseño** (`docs/redesign/04-design-system.md`). Lo que cambia va marcado **[Fase 1]**; todo lo demás se conserva tal cual y se documenta como conservado. Los ratios de contraste no se estiman: se miden con `npm run check:contrast`, que lee los tokens de `index.css`.

---

## 1. Canvas & Surface Hierarchy (highest impact)

Dark-primary theme, `class` strategy (`.dark` / `.light` on `<html>`), default = dark.

**[Fase 1]** Los tokens viven en `index.css` como canales RGB (`--c-*: R G B`) para que Tailwind pueda aplicar opacidad (`rgb(var(--c-x) / <alpha-value>)`). `tailwind.config.js` es el único sitio donde se les pone nombre; ningún componente lleva un HEX. El modo claro deja de ser un parche de `!important`: es una paleta diseñada y medida.

| Token | Dark hex | Light hex | Role |
|-------|----------|-----------|------|
| `--c-bg` / `background` | `#0F172A` | `#F8FAFC` | App canvas |
| `--c-surface` / `background-card` | `#1E293B` | `#FFFFFF` | Cards, sidebar, modals |
| `--c-surface-raised` / `background-lighter` | `#334155` | `#F1F5F9` | Raised/hover surface |
| `--c-text-primary` / `text-main` | `#F8FAFC` | `#0F172A` | Primary text (17.06:1) |
| `--c-text-secondary` | `#CBD5E1` | `#475569` | Secondary text |
| `--c-text-muted` | `#A0ADC0` | `#5B6B82` | Metadatos (>=4.5:1 en las 3 superficies) |
| `--c-border-input` | `#64748B` | `#64748B` | Límite de campo/control (>=3:1) |
| `--c-border-divider` / `divider` | `#334155` | `#E2E8F0` | Separadores decorativos |

**[Fase 1]** `text-muted` se corrigió respecto a `04-design-system.md` (`#94A3B8`→`#A0ADC0` en oscuro, `#64748B`→`#5B6B82` en claro) porque el valor del documento fallaba AA sobre `surface-raised` (4.04:1 y 4.34:1). Lo detectó el script, no el ojo.

Body background is never flat — always a **radial gradient**: `radial-gradient(circle at 50% 0%, var(--color-bg-card) 0%, var(--color-bg) 60%)`, `background-attachment: fixed`. This is the signature canvas treatment — never replace with a solid fill.

**DO:** Use the 3-step surface ladder (`bg` → `bg-card` → `bg-lighter`) for elevation, not box-shadow depth.
**DON'T:** Introduce pure black (`#000000`) as a surface — reserve true black only for overlay scrims (`bg-black/50`, `bg-black/80`).

---

## 2. Accent Color + Usage Rule

**[Fase 1] Single chromatic accent: Electric Violet.** El rojo queda liberado para significar **solo peligro**: el botón que empieza el entrenamiento y el que borra la cuenta ya no comparten color.

| | Dark | Light |
|---|---|---|
| `primary` (relleno) | `#A78BFA` | `#6D4AFF` |
| `primary-hover` | `#C4B5FD` | `#5B3FE0` |
| `primary-ink` (texto **sobre** el relleno) | `#0F172A` | `#FFFFFF` |

**Por qué el CTA lleva tinta oscura en modo oscuro:** un violeta lo bastante oscuro para que el blanco contraste se confunde con la tarjeta (`#6D4AFF` sobre `#1E293B` da 2.84:1, por debajo del 3:1 que exige un límite de componente). Relleno claro + tinta oscura cumple las dos cosas a la vez. Es el patrón `on-primary` de Material y aquí no es preferencia: es la única combinación que pasa ambas pruebas. Lo mismo aplica a los rellenos de `danger`, `success`, `warning` e `info`, cada uno con su `*-ink`.

**DON'T:** escribir `text-white` sobre un relleno de color. En modo claro `white` resuelve a tinta oscura. Usa `text-primary-ink` / `text-danger-ink` / etc.

Used **only** for: primary CTA fill, active nav item background/border (`bg-primary/10` + `border-primary/20`), XP numerals, brand wordmark suffix (`Hybrid**Pro**`), progress-bar fill, "highlight" pulse dots, focus rings.

**DO:** Pair red with its own glow shadow — `shadow-lg shadow-primary/30` on buttons, `shadow-[0_0_15px_rgba(220,38,38,0.1)]` on active nav, `shadow-[0_0_8px_#DC2626]` on the live-session pulse dot. The glow IS the brand signature, not decoration.
**DON'T:** Use red as a body-text color or large background fill. It is a CTA/status color only.

### Semantic / gamification colors (secondary, non-brand)
These are functional, not brand — used for game-state feedback, never for navigation chrome:
- **Success / completed:** `green-500`/`green-600` — finished sets, completed workouts, success toasts.
- **Warning / intermediate:** `yellow-500`/`amber` — RPE warnings, mid-tier difficulty.
- **Danger:** `danger` / `danger-fill` (`#F87171` osc. / `#DC2626` claro) — **[Fase 1]** el rojo ya solo aparece en acciones destructivas y en alertas reales (RPE >= 9, estado "Agotado", errores de formulario). Los nombres `red-*` de Tailwind están reasignados a estos tokens.
- **[Fase 1] Tipos de entrenamiento (eje nuevo, para el calendario):** `strength` (`#FB923C`/`#C2410C`), `cardio` (`#22D3EE`/`#0E7490`), `mobility` (`#A78BFA`/`#6D28D9`), `rest` (`#94A3B8`/`#475569`). El color nunca va solo: icono y etiqueta siempre acompañan.
- **Info:** `blue-500` — upcoming/scheduled states.
- **Achievement gold:** `amber-400/500` — Trophy icon, PR badges, level≥50 tier gradient. This is the "celebration" color, reserved for personal-record and milestone moments only.

### Level-tier gradient ladder (LevelBadge)
Progression is communicated by a 5-step gradient ladder, not just a number:
| Level range | Tier | Gradient |
|---|---|---|
| 1–9 | Novice | `slate-400 → gray-500 → zinc-600` |
| 10–19 | Regular | `emerald-400 → green-500 → teal-500` |
| 20–29 | Intermediate | `cyan-400 → blue-500 → indigo-500` |
| 30–49 | Advanced | `purple-500 → violet-500 → fuchsia-500` |
| 50+ | Elite | `amber-400 → yellow-500 → orange-500` |

**DON'T:** Invent new tier colors — the ladder is closed at 5 stops, each with a matching `ring-*/50` and `shadow-*/40` glow.

---

## 3. Typography

**Font:** Inter exclusively (`fontFamily.sans = ['Inter','sans-serif']`), servida desde el propio dominio (`/fonts/*.woff2`), no desde Google Fonts. **Se conserva**: no hay segunda tipografía.

**[Fase 1] Escala modular** base 16px, razón 1.25, con el interlineado dentro del propio token (1.2–1.3 en títulos, 1.5 en cuerpo, 1.0 en cifras grandes):

| Clase | px | Uso |
|---|---|---|
| `text-2xs` | 11 | Etiquetas de badge en mayúsculas (**sustituye a `text-[10px]`**) |
| `text-xs` | 12 | Metadatos, ejes de gráfica |
| `text-sm` | 14 | Texto secundario, etiquetas de formulario |
| `text-base` | 16 | Cuerpo. **Mínimo absoluto en cualquier `<input>`** |
| `text-lg` | 20 | Títulos de tarjeta |
| `text-xl` | 25 | Título de pantalla |
| `text-2xl` | 31 | Cifra destacada |
| `text-3xl` | 39 | Héroe: cronómetro, XP, distancia |
| `text-4xl` | 49 | Celebración a pantalla completa |

**[Fase 1]** `font-variant-numeric: tabular-nums` en `body`: sin esto el cronómetro da saltos cada vez que un dígito cambia de ancho.

**DON'T:** bajar de 16px en un campo de entrada. Safari en iOS hace zoom al enfocarlo y deja la pantalla desencuadrada a mitad de serie.

| Role | Weight | Tracking | Notes |
|---|---|---|---|
| Page/section headings | `font-bold` (700) / `font-black` (900) for hero numbers | default/tight | `text-2xl`–`text-4xl` |
| Workout hero title (today card) | `font-black`, `text-3xl md:text-4xl` | tight (`leading-tight`) | largest text in the app |
| Body / labels | `font-medium`/`font-semibold` | normal | `text-sm` default |
| Buttons | `font-bold` always | normal | never regular weight |
| Badges / pills | `font-bold uppercase tracking-wider` | wide | always uppercase, always tracked out |
| XP/stat numerals | `font-bold`/`font-black` | normal | numerals get heavier weight than their labels |
| Nav labels | `font-medium` | normal | `font-bold` only for active/highlighted state |

**DO:** Reach for `font-black` on hero numbers, level digits, workout titles, PR exercise names — weight communicates intensity in this brand (opposite of the "never bold" luxury convention; Hybrid is energetic, not restrained).
**DO:** Uppercase + `tracking-wider` on every badge/pill/level-name label — this is the one consistent "small text" treatment across the whole app.

---

## 4. Border-Radius Doctrine

**Medium-large, rounded-soft** — not pill, not sharp. The app reads as "energetic but not corporate."

| Element | Radius | Class |
|---|---|---|
| Buttons (sm) | 8px | `rounded-lg` |
| Buttons (md/lg), nav items | 12px | `rounded-xl` |
| Cards, modals | 16px | `rounded-2xl` |
| Hero/workout-day cards | 24px | `rounded-3xl` |
| Badges, input fields | 6–8px | `rounded` / `rounded-lg` |
| Avatars, level badges, icon chips | full | `rounded-full` |

**Why:** rounded-xl/2xl signals approachable-but-serious (gym app, not lifestyle pill-button SaaS); `rounded-3xl` on the day-card hero gives it poster-like presence. Avatars/level rings stay circular — RPG portrait convention.

**DON'T:** Use sharp 0px corners anywhere — this brand has zero editorial/luxury restraint signaling.

---

## 5. Shadow & Glow Philosophy

Not "no shadow" (infra convention) and not "heavy shadow" (consumer convention) — **colored glow shadows tied to the accent/semantic color**, used sparingly and only on energetic/interactive elements.

- **[Fase 1]** Los glow y las sombras son tokens, no valores arbitrarios: `shadow-glow-primary`, `shadow-glow-celebration`, `shadow-card`, `shadow-raised`, `shadow-sheet`. En modo claro los glow valen `none` y las sombras son neutras y planas.
- Primary buttons: `shadow-glow-primary`
- Danger/success buttons: `shadow-raised`
- Live/highlighted pulse dot: `shadow-glow-primary`
- Level badge: `shadow-lg` + tier-matched `shadow-{color}-500/40`
- Sidebar/modal: plain `shadow-2xl` (neutral, structural — not glow)
- Light mode cards: flat `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` — glow effects are dark-mode only

**Rule:** glow shadow color must always match the element's own accent (red button → red glow, amber trophy → amber glow). Never a glow in an unrelated hue.

---

## 6. Spacing & Layout

Base unit **4px**, Tailwind default scale, no custom spacing tokens. Card padding follows `sm:p-3 / md:p-4 md:p-6 / lg:p-6 md:p-8`. Page content capped at `max-w-7xl mx-auto` with `p-4 md:p-8`.

Layout shell: fixed 64px-wide (`w-64`) sidebar (desktop) collapsing to slide-over drawer (mobile, `-translate-x-full` ↔ `translate-x-0`), 64px (`h-16`) sticky header, scrollable `<main>`.

---

## 7. Motion

Custom keyframes live in `tailwind.config.js` — this is a hand-tuned, gamification-driven motion system, not a generic transition library:

| Animation | Duration | Use |
|---|---|---|
| `fade-in` / `fade-in-up` | 200–250ms ease-out | content entrances |
| `scale-in` | 200ms ease-out | modals, popovers |
| `slide-up` | 300ms ease-out | bottom sheets |
| `xp-fly` | 1s ease-out forwards | floating "+XP" reward text |
| `check-pop` | **[Fase 1]** 600ms `cubic-bezier(.34,1.56,.64,1)` | set-completion checkmark |

**[Fase 1] Tokens de motion:** `duration-instant|fast|base|sheet|celebrate` = 100/150/250/300/600ms; `ease-physical` = `cubic-bezier(.32,.72,0,1)`, `ease-celebrate` = `cubic-bezier(.34,1.56,.64,1)`. `ease-physical` sale muy rápido y frena largo: es lo que hace que un sheet se sienta físico en lugar de animado.

**Regla:** `prefers-reduced-motion` reduce el movimiento, **nunca la información**. El "+XP" sigue apareciendo, simplemente sin trayectoria.
| `prEnter` (PRBadge-local) | 500ms ease-out, overshoot to 1.04 | personal-record card entrance |
| shimmer (XP bar) | 2s infinite | progress-bar fill highlight sweep |

Interactive elements: `hover:scale-105 active:scale-95` on primary buttons/badges — tactile "press" feedback everywhere, not just primary CTA.

**DO:** Respect `prefers-reduced-motion: reduce` — globally forced to `0.01ms` durations (already implemented in `index.css`, keep this when adding any new animation).

---

## 8. Component State Coverage

| Component | Default | Hover | Active | Focus | Disabled |
|---|---|---|---|---|---|
| Button (primary) | `bg-primary text-primary-ink` + glow | `bg-primary-hover`, `scale-105` | `scale-95` | `ring-2 ring-primary ring-offset-2` | `opacity-50 cursor-not-allowed`, scale locked |
| Button (secondary) | `bg-background-card border-divider` | `bg-surface-raised border-border-input` | `scale-95` | same ring | same |
| Nav item | `text-muted` | `bg-background-lighter/50 text-white` | — | — | — |
| Nav item (active) | `bg-primary/10 border-primary/20 text-primary` + glow | — | — | — | — |
| Input | `border-gray-700` | — | — | `border-primary ring-1 ring-primary` | — |
| Card (`hover` prop) | `border-gray-700` | `border-gray-600` | — | — | — |

---

## 9. Do's and Don'ts

- **DO** keep exactly one chromatic brand accent (**[Fase 1]** violeta, token `primary`); all other color is semantic/game-state, never navigational.
- **[Fase 1] DON'T** escribir un HEX dentro de un componente. Verificable: `grep -rE "#[0-9A-Fa-f]{6}" --include="*.tsx"` sale vacío.
- **[Fase 1] DON'T** usar rojo para nada que no sea destructivo o una alerta real.
- **[Fase 1] DO** dar 44px de alto mínimo (`min-h-11`) a todo control táctil: `Button`, `Input` y los cierres de `Modal`/`Toast` ya lo llevan. El foco de teclado es visible en cualquier elemento por la regla global `:focus-visible` de `index.css`.
- **DO** treat amber/gold as the dedicated "celebration" register — PRs, level 50+, achievements only.
- **DO** uppercase + wide-track every badge and level-name label.
- **DO** use `font-black` liberally on numerals and hero titles — weight = energy in this brand.
- **DON'T** use pill (`rounded-full`) buttons — reserved for avatars/icon chips/level rings only.
- **DON'T** add a glow shadow that doesn't match its element's own color.
- **DON'T** flatten the canvas to solid color — the radial gradient body background is mandatory.
- **FORBIDDEN:** mixing tier-ladder colors outside the LevelBadge 5-stop system (no inventing a 6th tier color).

---

## 10. Quick Reference (Tailwind tokens)

```
colors.primary       dark #A78BFA / light #6D4AFF  + hover + ink
colors.background    DEFAULT / card / lighter   (= bg / surface / surface-raised)
colors.text          main / secondary / muted
semantic             success warning danger info celebration (+ .fill / .ink)
tipos                strength cardio mobility rest
font                 Inter (400–900), self-hosted, tabular-nums
type scale           2xs(11) xs(12) sm(14) base(16) lg(20) xl(25) 2xl(31) 3xl(39) 4xl(49)
radius               lg(12) xl(12) 2xl(16) 3xl(24) full   — mínimo 8px, nunca 0
shadow               card / raised / sheet / glow-primary / glow-celebration
motion               duration-instant|fast|base|sheet|celebrate, ease-physical|celebrate
spacing              4px base, Tailwind default scale
darkMode             class ('.dark' / '.light' on <html>)
verificación         npm run check:contrast
```
