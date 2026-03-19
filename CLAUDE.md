# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Vision

**FitGame Pro** es una Web App móvil-first de entrenamiento con gamificación y seguimiento en tiempo real. Combina principios científicos de hipertrofia (basados en programas de Jeff Nippard) con UX de fricción mínima.

**Flujo principal**: Onboarding → Plan personalizado → Ejecutar sesiones → Ganar XP → Ver progreso

## Estado del Proyecto

**Fase actual: Production-Ready** — Última actualización: 2026-03-19

Todos los sprints completados: auth, onboarding, WorkoutPlayer, XP, scheduling, offline queue, recommended weights, history, PWA, a11y, CI/CD, code splitting, mobile polish, E2E tests, performance sprint (lazy Supabase, vendor chunks, PWA notifications, CSV export, PR history chart).

Estado: **0 TS errors · 138 unit tests · 36 E2E tests · 256 kB startup JS**

## Build & Development Commands

```bash
npm run dev           # Dev server en http://localhost:3000
npm run build         # Build producción a /dist
npm run preview       # Preview del build
npm run test          # Vitest run (138 unit tests)
npm run test:watch    # Vitest watch mode
npm run lint          # ESLint --max-warnings 0
npm run type-check    # TypeScript sin compilar
npm run test:e2e      # Playwright E2E (36 tests, chromium + mobile-chrome)
npm run test:e2e:ui   # Playwright UI mode
npm run test:e2e:headed  # Playwright con browser visible
```

**Run a single unit test file:**
```bash
npx vitest run services/xp.test.ts
```

**Run a single E2E spec:**
```bash
npx playwright test tests/e2e/auth.spec.ts
```

## Tech Stack

```
Frontend: React 19 + TypeScript (strict) + Vite 6 + Tailwind CSS v3 (PostCSS build)
Estado:   Context API (AppContext) + localStorage (offline-first)
Backend:  Supabase v2.94 (auth + PostgreSQL + RLS)
Icons:    Lucide React
Charts:   Recharts
Testing:  Vitest + React Testing Library + Playwright
PWA:      vite-plugin-pwa (workbox generateSW, manifest, custom importScripts)
Deploy:   Vercel (vercel.json SPA rewrites)
CI/CD:    GitHub Actions (tsc + vitest + vite build)
```

## Folder Structure

```
/
├── components/
│   ├── ui/         # Button, Input, Slider, Modal, Card, Toast, Skeleton
│   ├── home/       # WorkoutDayCard, WelcomeChecklist
│   ├── progress/   # LevelBadge, XPBar
│   ├── session/    # SessionHeader, ExerciseSidebar, ExerciseCard, SetCard,
│   │               # SessionSummary, SessionStats, XPBreakdown, PRBadge, RPESlider, RestTimer
│   ├── workout/    # AddExerciseModal
│   ├── DateSelector.tsx
│   ├── ErrorBoundary.tsx
│   ├── InstallBanner.tsx
│   ├── SyncIndicator.tsx
│   ├── WeeklySummaryModal.tsx
│   └── Layout.tsx
├── pages/          # Dashboard, WorkoutPlayer, WorkoutSummary, Schedule, Templates,
│                   # TemplateEditor, Onboarding, Progress, History, Programs,
│                   # Challenges, ExerciseLibrary, Settings, Login, Signup
├── context/        # AppContext.tsx (estado global + 18 integration tests)
├── hooks/          # usePersist, useSessionTimer, useRestTimer, useOnlineStatus,
│                   # useInstallPrompt, useTheme
├── lib/            # supabase.ts, utils.ts, constants.ts, logger.ts, dateUtils.ts,
│                   # calculations.ts, sessionCalculations.ts, weightRecommendation.ts,
│                   # templateGenerator.ts, badges.ts, challenges.ts, notifications.ts,
│                   # share.ts, weeklySummary.ts, recommendations.ts
├── services/       # auth.ts, xp.ts, workoutSessions.ts, templates.ts,
│                   # offlineQueue.ts, socialChallenges.ts, audio.ts
├── types/          # index.ts (app types), database.ts (Supabase types)
├── data/           # exerciseBlueprints.ts (67 exercises), mockData.ts, presetPrograms.ts
├── supabase/       # schema.sql + migrations/ (5 timestamped files)
├── tests/e2e/      # Playwright specs (auth, onboarding, dashboard, workout, navigation)
├── public/         # favicon.svg, pwa-*.png/svg, og-image.svg, sw-notifications.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── index.css       # Tailwind directives + scrollbar + autofill fix
```

## Architecture Notes

### State Management (AppContext)

- Estado centralizado en `context/AppContext.tsx`
- **localStorage-first**: todas las mutaciones persisten inmediatamente; Supabase sync es secondary/non-blocking
- `updateUser()` persiste dentro de setState callback (sync, no useEffect race condition)
- `initAuth()` tiene fallback a localStorage cuando Supabase falla

### Supabase (Lazy Singleton)

`lib/supabase.ts` exporta `getSupabase()` — función async que crea el cliente solo al primer uso. Evita que el bundle de Supabase (174 kB) se cargue en startup. Todos los servicios hacen `await getSupabase()`.

```typescript
// ❌ Don't: import { supabase } from '@/lib/supabase'
// ✅ Do:    const sb = await getSupabase()
```

### Routing

Routing por estado, no por URL. Toda la navegación cambia `currentView` en AppContext (string enum de `ROUTES` en `lib/constants.ts`). Login/Signup NO son lazy-loaded (necesarios antes del auth gate). Las otras 13 páginas usan React.lazy + Suspense con skeletons específicos (DashboardSkeleton, ProgressSkeleton, HistorySkeleton).

### WorkoutPlayer

- Renderiza **fuera** del Layout shell (App.tsx bypasses sidebar) — pantalla completa
- `summarySnapshot` useRef preserva datos del resumen cuando `activeWorkout` → null
- Summary guard BEFORE derived state prevents null crash
- Rest timer usa `endTime` (timestamp absoluto) para sobrevivir throttling del browser
- `completeSession()`: snapshot data BEFORE calling (activeWorkout se pone null)

### Offline Queue

`services/offlineQueue.ts` encola operaciones cuando offline. Usa exponential backoff con MAX_RETRIES=5. En tests, usar `vi.useFakeTimers()` para evitar timeouts. Mock `getSupabase` (no `supabase`) con shared `mockClient` object.

### PWA Notifications

`public/sw-notifications.js` se inyecta via workbox `importScripts` (no `injectManifest`). Está en `globIgnores` para no ser precacheado. App → SW via `postMessage({type:'SHOW_REMINDER',...})`. La lógica de negocio está en `lib/notifications.ts`.

### Bundle Splits

```
react-vendor:    ~11.8 kB  (react + react-dom)
supabase-vendor: ~174 kB   (lazy-loaded, not in startup)
main chunk:      ~256 kB   (startup JS)
CSS:             ~66.3 kB  (tree-shaken PostCSS)
```

## E2E Testing (Playwright)

Dos proyectos: `chromium` (desktop 1280×720) + `mobile-chrome` (Pixel 5).

**Setup**: `.env.test` tiene variables Supabase vacías → fuerza modo offline para E2E.

```bash
# E2E necesita Vite en modo test (no .env.local)
npx vite --mode test   # lo lanza playwright.config.ts automáticamente
```

**Helpers en tests/e2e/helpers.ts**: `seedAuth()`, `seedFullState()`, `login()`, `completeOnboarding()`

**Gotchas E2E críticos**:
- Routing es estado, no URL — no navegar por URL, seed localStorage y clicar nav
- `ACTIVE_WORKOUT` en localStorage no auto-navega al player — clicar "Start Session"
- "Dashboard" aparece en sidebar en TODAS las páginas — no usar como indicador de dashboard
- En mobile, nombres de ejercicio en sidebar están ocultos — usar `getByRole('heading')`
- `getByText('X').first()` puede agarrar elementos ocultos del sidebar — preferir `getByRole`
- Dashboard muestra `user.name.split(' ')[0]` (solo primer nombre)

## XP System

```typescript
XP_PER_SET = 5
XP_BONUS_RPE_9_PLUS = 10
XP_BONUS_PR = 25
XP_BONUS_FULL_COMPLETION = 30
XP_BONUS_STREAK_MULTIPLIER = (streakDays) => streakDays  // multiplier
XP_BONUS_MORNING = 0.2  // +20% si entrena 6-10am
```

Niveles: Novato(0) → Iniciado(100) → Regular(250) → Dedicado(500) → ...

## Core Data Models

```typescript
interface WorkoutSession {
  id: string; // MUST be crypto.randomUUID() for Supabase UUID columns
  date: string;
  type: "push" | "pull" | "legs" | "upper" | "lower" | "full";
  exercises: Exercise[];
  status: "scheduled" | "in_progress" | "completed" | "skipped";
  xpEarned?: number;
}

interface UserProfile {
  id: string;
  goal: "Strength" | "Hypertrophy" | "Fat Loss" | "Endurance";
  daysPerWeek: number;       // 3–6
  minutesPerSession: number; // 30–90
  equipment: string[];
  experienceLevel: "Beginner" | "Intermediate" | "Advanced";
  onboardingCompleted: boolean;
}
```

## Supabase Tables

```
profiles          — XP, level, streak, tier, preferences, weekly_schedule
templates         — Workout templates (JSONB exercises, UUID id)
workout_sessions  — Sessions with exercises, XP, timestamps (UUID id)
personal_records  — Best lifts per exercise, UNIQUE(user_id, exercise_id)
```

Migraciones en `supabase/migrations/` (5 archivos con timestamps).

## Theme

Dark mode con accent rojo (`#DC2626`) — definido en `tailwind.config.js`:

- Background: `slate-950` (`#0f172a`)
- Cards: `slate-800` (`#1e293b`)
- Lighter: `slate-700` (`#334155`)
- Text main: `slate-50`
- Text muted: `slate-300` (mínimo para WCAG)
- Glassmorphism: `backdrop-blur-xl`

## Code Conventions

- **`cn()`** para clases condicionales (cast `unknown[]` para `.flat(Infinity)` — evita TS2589)
- **Mobile-first** (min-width breakpoints), touch targets ≥ 44×44px
- **Logger**: `lib/logger.ts` reemplaza todos los `console.*` — solo activo en DEV
- **IDs para Supabase**: siempre `crypto.randomUUID()`, nunca strings arbitrarios
- **ErrorBoundary**: usa `declare` keyword para React 19 class component TS compatibility
- **`types/database.ts`**: `Relationships: []` + `{ [_ in never]: never }` para mapped types vacíos

## Important Rules

```
❌ NO usar "any" en TypeScript
❌ NO crear componentes clase (solo funcionales, excepto ErrorBoundary)
❌ NO hardcodear colores (usar Tailwind tokens de tailwind.config.js)
❌ NO usar console.log (usar lib/logger.ts)
❌ NO depender solo de Supabase para persistencia (localStorage-first siempre)
❌ NO importar supabase directamente — usar await getSupabase()
❌ NO olvidar estados loading/error en UI
❌ NO ignorar accesibilidad (ARIA, keyboard nav, 44px touch targets)
```

## Pre-Commit Checklist

```
□ TypeScript compila sin errores (npm run type-check)
□ Unit tests pasan (npm run test — 138 tests)
□ Build exitoso (npm run build)
□ Responsive verificado (320px mínimo)
□ No console.log en código (usar logger.ts)
```

## Custom Agents

Agentes disponibles en `.claude/agents/`:

| Agent               | Uso                                                               |
| ------------------- | ----------------------------------------------------------------- |
| **qa-tester**       | Testing de flujos, responsive, edge cases, accesibilidad          |
| **code-reviewer**   | Review de código, TypeScript, patterns React, performance         |
| **ux-designer**     | Diseño de flujos, micro-interacciones, estados UI                 |
| **training-expert** | Validación de lógica de entrenamiento, RPE, progresiones, volumen |
| **session-manager** | Gestión de sesiones, notas, tracking de progreso, CLAUDE.md       |
| **github-expert**   | Git/GitHub: commits, branches, PRs, conflictos, CI/CD            |

## Session Notes

| Comando             | Acción                                           |
| ------------------- | ------------------------------------------------ |
| `"guardar notas"`   | Genera resumen y guarda en docs/session-notes/   |
| `"cerrar sesión"`   | Igual que guardar notas + resumen para CLAUDE.md |
| `"qué hicimos hoy"` | Muestra resumen sin guardar archivo              |

Al final de cada sesión productiva, Claude debe sugerir actualizaciones para la sección "Estado del Proyecto".

## MCP Servers

### Context7

Usar Context7 automáticamente para documentación de librerías sin que el usuario lo pida.

**Librerías frecuentes**:
- `/tailwindlabs/tailwindcss`
- `/vitejs/vite`
- `/supabase/supabase-js`
- `/microsoft/playwright`
