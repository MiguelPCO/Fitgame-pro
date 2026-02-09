# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Vision

**FitGame Pro** es una Web App móvil-first de entrenamiento con gamificación y seguimiento en tiempo real. Combina principios científicos de hipertrofia (basados en programas de Jeff Nippard) con UX de fricción mínima.

**Flujo principal**: Onboarding → Plan personalizado → Ejecutar sesiones → Ganar XP → Ver progreso

## Estado del Proyecto

### Fase actual: Post-MVP — Production-Ready

- [x] Auth básico (mock + Supabase)
- [x] Onboarding
- [x] WorkoutPlayer funcional
- [x] Sistema XP completo (PRs, bonuses, streaks, morning bonus)
- [x] Refactor estructura (componentes UI, hooks, services, lib)
- [x] Backend Supabase (auth + profiles + sessions + personal_records)
- [x] Componentes Home: WorkoutDayCard, LevelBadge, XPBar
- [x] DateSelector mejorado (navegación semanal)
- [x] Fase 2: SessionHeader + integración WorkoutPlayer + XP en vivo + QA
- [x] Fase 3: Rediseño WorkoutPlayer (2-col layout, ExerciseSidebar, ExerciseCard, SetCard)
- [x] Fase 3b: Session Summary (SessionStats, XPBreakdown, PRBadge, SessionSummary, confetti)
- [x] Sprint Consolidación: PRs persistidos, Dashboard real, Progress real
- [x] Fix: 0 errores TypeScript
- [x] Sistema de Scheduling (asignar templates a días de la semana)
- [x] Onboarding Flow completo (wizard 7 pasos, 35 ejercicios, template auto-generado)
- [x] Offline Queue (sync pendientes al recuperar conexión)
- [x] Historial de sesiones (página dedicada con búsqueda, filtros por músculo, detalle expandible)
- [x] Recommended Weight System (double progression automático desde historial)
- [x] Alta prioridad: ErrorBoundary, logger dev-only, .gitignore mejorado, error handling en servicios
- [x] Media prioridad: MIT License, SEO/OG meta tags, PWA (manifest + service worker), Testing, Accesibilidad (ARIA, focus trap, skip-nav)
- [x] Baja prioridad: Code splitting (React.lazy), memoización WorkoutPlayer, migraciones DB
- [x] Prioridad crítica: Toast system, Settings/Profile page, OG image SVG, viewport WCAG fix
- [x] Alta prioridad (2): CI/CD GitHub Actions, password reset, account deletion, integration tests (18)
- [x] Media prioridad (2): Offline queue tests (19), data export JSON, sync failure notifications
- [x] Baja prioridad (2): Constantes extraídas (UI_TIMING, USER_DEFAULTS), lib/dateUtils.ts, a11y forms (htmlFor/id), Slider aria, dead code cleanup (SetRow removed), avatar SVG inline

### Última actualización: 2026-02-09

Supabase integrado:

- `/lib/supabase.ts` - Cliente con fallback offline
- `/services/auth.ts` - signUp, signIn, signOut
- `/services/workoutSessions.ts` - CRUD sessions + getPersonalRecords + upsertPersonalRecords
- `/services/templates.ts` - CRUD templates sincronizado
- `/types/database.ts` - Tipos para 4 tablas Supabase (profiles, templates, workout_sessions, personal_records)
- `/supabase/schema.sql` - Esquema de BD completo con RLS (4 tablas)
- `/supabase/migrations/` - Migraciones timestamped (3 archivos)

Componentes de sesion:

- `/components/session/SessionHeader.tsx` - Header con timer, XP, exit modal
- `/components/session/ExerciseSidebar.tsx` - Lista de ejercicios con estados
- `/components/session/ExerciseCard.tsx` - Card rediseñada con imagen, badges, grid
- `/components/session/SetCard.tsx` - Card individual de set con 3 estados
- `/components/session/SessionSummary.tsx` - Resumen post-sesión con confetti
- `/components/session/SessionStats.tsx` - 4 stat cards
- `/components/session/XPBreakdown.tsx` - Desglose XP animado
- `/components/session/PRBadge.tsx` - Badge de PR con animación

Scheduling, Onboarding y Offline:

- `/pages/Schedule.tsx` - Asignar templates a días de la semana
- `/pages/Onboarding.tsx` - Wizard 7 pasos, genera plan personalizado
- `/data/exerciseBlueprints.ts` - 35 ejercicios con metadata completa
- `/lib/templateGenerator.ts` - Auto-genera templates según preferencias
- `/hooks/useOnlineStatus.ts` - Detecta online/offline + reconnect callback
- `/services/offlineQueue.ts` - Cola de operaciones pendientes con retry
- `/components/SyncIndicator.tsx` - Indicador visual de sync

Recommended Weight y History:

- `/lib/weightRecommendation.ts` - Double progression (getRecommendedWeight, getWarmupWeight)
- `/pages/History.tsx` - Historial con búsqueda, filtros por músculo, detalle expandible

Hardening y Production-Ready:

- `/components/ErrorBoundary.tsx` - Error boundary con retry/reload (React 19 `declare` pattern, usa logger)
- `/components/ui/Toast.tsx` - Toast notification system (ToastProvider + useToast hook)
- `/lib/logger.ts` - Dev-only logger (reemplaza todos los console.log/error/warn)
- `/lib/constants.ts` - ROUTES, XP, STORAGE_KEYS, UI_TIMING, USER_DEFAULTS, DEFAULT_SET_CONFIG
- `/lib/dateUtils.ts` - Shared date utils (isSameDay, isPastDay, getTimeAgo, formatDuration, formatDateEs)
- `/lib/weightRecommendation.test.ts` - 13 tests (double progression)
- `/services/xp.test.ts` - 16 tests (XP system completo)
- `/services/offlineQueue.test.ts` - 19 tests (queue CRUD, processQueue, withOfflineQueue)
- `/context/AppContext.test.ts` - 18 tests (session lifecycle, XP, PRs, stats, weight rec)
- `/vitest.setup.ts` - Setup de testing
- `/.env.example` - Template de variables de entorno
- `/.github/workflows/ci.yml` - CI/CD pipeline (tsc + vitest + build)
- `/LICENSE` - MIT License
- `/public/favicon.svg`, `/public/pwa-*.svg`, `/public/og-image.svg` - Iconos PWA + OG image

Dashboard y Progress:

- `/pages/Dashboard.tsx` - Stats semanales reales, calendario real, card "Last Session"
- `/pages/Progress.tsx` - Heatmap real (60 días), lista de PRs, streak card, volume charts
- `/lib/sessionCalculations.ts` - calculateSessionStats, calculateXPBreakdown, detectPRs

## Build & Development Commands

```bash
npm run dev          # Dev server en http://localhost:3000
npm run build        # Build producción a /dist
npm run preview      # Preview del build
npm run test         # Vitest run (66 tests)
npm run test:watch   # Vitest watch mode
npm run lint         # ESLint check
npm run type-check   # TypeScript sin compilar
```

## Tech Stack

```
Frontend: React 19 + TypeScript (strict) + Vite + Tailwind CSS (CDN inline config)
Estado:   Context API (AppContext) + localStorage (persistencia offline)
Backend:  Supabase v2.94 (auth + PostgreSQL + RLS)
Forms:    React Hook Form + Zod (validation)
UI:       Lucide React (iconos) + Framer Motion (animaciones)
Charts:   Recharts
Testing:  Vitest + React Testing Library + jest-dom
PWA:      vite-plugin-pwa (workbox, manifest, service worker)
```

## Folder Structure

```
/
├── /components
│   ├── /ui           # Button, Input, Slider, Modal, Card
│   ├── /home         # WorkoutDayCard
│   ├── /progress     # LevelBadge, XPBar
│   ├── /session      # SessionHeader, ExerciseSidebar, ExerciseCard, SetCard,
│   │                 # SessionSummary, SessionStats, XPBreakdown, PRBadge
│   ├── /workout      # ExerciseCard, SetInput, Timer
│   └── DateSelector.tsx
├── /pages            # Login, Signup, Onboarding, Dashboard, WorkoutPlayer, Progress,
│                     # Templates, TemplateEditor, Schedule, History, Settings
├── /context          # AppContext.tsx (estado global)
├── /hooks            # usePersist, useSessionTimer, useRestTimer, useOnlineStatus
├── /lib              # supabase.ts, utils.ts, constants.ts, sessionCalculations.ts,
│                     # weightRecommendation.ts, templateGenerator.ts, dateUtils.ts, logger.ts
├── /services         # auth.ts, xp.ts, audio.ts, workoutSessions.ts, templates.ts,
│                     # offlineQueue.ts
├── /types            # index.ts, database.ts
├── /data             # mockData.ts, exerciseBlueprints.ts
├── /supabase         # schema.sql + migrations/
├── /public           # favicon.svg, pwa-*.svg (PWA icons)
└── /docs             # session-notes/
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

## Code Conventions

### Naming

```typescript
// Componentes: PascalCase
WorkoutDayCard.tsx;

// Hooks: camelCase con prefijo "use"
useSession.ts;

// Utilidades: camelCase
formatDate.ts;

// Types: PascalCase
(UserProfile, WorkoutSession, CompletedSet);
```

### Component Pattern

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', isLoading = false, children, ...props }: ButtonProps) {
  return (
    <button className={cn(baseStyles, variants[variant], sizes[size])} disabled={isLoading} {...props}>
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}
```

### Rules

- Mobile-first (min-width breakpoints)
- Touch targets mínimo 44x44px
- Usar `cn()` para clases condicionales
- Design tokens en tailwind.config.js

## XP System (Gamification)

```typescript
const XP_PER_SET = 5;
const XP_BONUS_RPE_9_PLUS = 10;
const XP_BONUS_PR = 25;
const XP_BONUS_FULL_COMPLETION = 30;
const XP_BONUS_STREAK_MULTIPLIER = (streakDays) => streakDays;
const XP_BONUS_MORNING = 0.2; // +20% si entrena 6-10am

// Niveles: Novato(0) → Iniciado(100) → Regular(250) → Dedicado(500) → ...
```

## Core Data Models

```typescript
interface UserProfile {
  id: string;
  goal: "strength" | "hypertrophy" | "fat_loss" | "endurance";
  daysPerWeek: number; // 3-6
  minutesPerSession: number; // 30-90
  equipment: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced";
  splitPreference: "full_body" | "upper_lower" | "ppl";
}

interface WorkoutSession {
  id: string;
  date: string;
  type: "push" | "pull" | "legs" | "upper" | "lower" | "full";
  exercises: Exercise[];
  status: "scheduled" | "in_progress" | "completed" | "skipped";
  xpEarned?: number;
}

interface CompletedSet {
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number;
  isPR: boolean;
}
```

## Supabase Tables

```
profiles          — User data (XP, level, streak, tier, preferences)
templates         — Workout templates with JSONB exercises
workout_sessions  — Completed/active sessions with exercises, XP, timestamps
personal_records  — Best lifts per exercise, UNIQUE(user_id, exercise_id)
```

## Architecture Notes

### State Management (AppContext)

- Estado centralizado en `context/AppContext.tsx`
- Persistencia dual: localStorage (offline) + Supabase (online)
- Rest timer usa `endTime` (timestamp absoluto) para sobrevivir throttling del browser
- Audio notifications via Web Audio API + `navigator.vibrate()`
- `completeSession()` persiste: session → PRs → profile XP (en ese orden)

### Workout Flow

```
Dashboard → startSession() → WorkoutPlayer → completeSession() → SessionSummary → XP awarded
                                                    ↓
                                          saveCompletedSession()
                                          upsertPersonalRecords()
                                          updateProfile(XP/level)
```

### Key Patterns

- WorkoutPlayer renders outside Layout shell (App.tsx bypasses sidebar)
- `summarySnapshot` useRef preserva datos across null transition de activeWorkout
- Summary guard BEFORE derived state prevents null crash
- `personal_records` tabla con UNIQUE constraint para upsert eficiente
- Dashboard/Progress usan `useMemo` con `workoutHistory` para stats reales
- `startSessionFromTemplate` pre-rellena pesos via `getRecommendedWeight()` (double progression)
- Warmup sets reciben 60% del peso top-set recomendado
- History page: búsqueda + filtro por músculo + detalle expandible por sesión
- Code splitting: React.lazy + Suspense para todas las páginas (bundle 933→427 kB)
- WorkoutPlayer: useMemo/useCallback para computaciones y handlers costosos
- SyncIndicator: toast on sync success/failure, drops ops after MAX_RETRIES=5
- Settings: data export (JSON backup), password reset, account deletion (double confirm)
- Modal: focus trap, aria-modal, auto-focus, restore focus on close
- Layout: skip-nav link, aria-label en navegación
- ErrorBoundary: `declare` keyword para React 19 class component TS compatibility
- Logger dev-only: `import.meta.env.DEV` gate, reemplaza todos los console.*

## Important Rules

```
❌ NO usar "any" en TypeScript
❌ NO crear componentes clase (solo funcionales)
❌ NO hardcodear colores (usar Tailwind tokens)
❌ NO olvidar estados de loading/error
❌ NO ignorar accesibilidad (ARIA, keyboard nav)
❌ NO mezclar lógica de negocio en componentes UI
```

## Pre-Commit Checklist

```
□ TypeScript compila sin errores
□ ESLint pasa
□ Props tipadas con interfaces
□ Estados loading/error implementados
□ Responsive verificado (320px mínimo)
□ Touch targets >= 44px
□ No console.log en código final
```

## Theme

Dark mode con accent rojo (`#DC2626`):

- Background: slate-950 (`#0f172a`)
- Cards: slate-800 (`#1e293b`)
- Glassmorphism: `backdrop-blur-xl`

## Environment

`.env.local`:
- `VITE_SUPABASE_URL` — URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` — Anon key de Supabase

## 🔧 Comandos Personalizados

### Notas de Sesión

Cuando escribas alguno de estos comandos, Claude ejecutará el skill de notas:

| Comando             | Acción                                           |
| ------------------- | ------------------------------------------------ |
| `"guardar notas"`   | Genera resumen y guarda en docs/session-notes/   |
| `"cerrar sesión"`   | Igual que guardar notas + resumen para CLAUDE.md |
| `"qué hicimos hoy"` | Muestra resumen sin guardar archivo              |

### Ejemplo de uso

```
Usuario: "guardar notas"
Claude:
1. Analiza la conversación
2. Crea docs/session-notes/2026-02-03-18-30.md
3. Muestra resumen en terminal
4. Confirma: "✅ Notas guardadas en docs/session-notes/2026-02-03-18-30.md"
```

### Actualización de Estado

Al final de cada sesión productiva, Claude debe sugerir actualizaciones para la sección "Estado del Proyecto" de este CLAUDE.md.

## 🔌 MCP Servers

### Context7

Usa Context7 automáticamente cuando necesites:

- Documentación de librerías (React, Tailwind, Framer Motion, etc.)
- Ejemplos de código actualizados
- APIs y configuraciones

**Regla**: Siempre usa Context7 MCP para obtener documentación de librerías sin que el usuario lo pida explícitamente.

**Librerías frecuentes del proyecto**:

- `/vercel/next.js` - Next.js (si migras)
- `/tailwindlabs/tailwindcss` - Tailwind CSS
- `/framer/motion` - Framer Motion
- `/react-hook-form/react-hook-form` - React Hook Form
- `/colinhacks/zod` - Zod validation

```

---

## Uso en Prompts

Ahora cuando trabajes en Claude Code, puedes ser explícito si quieres:
```

Implementa el RPESlider usando Framer Motion para las animaciones. use context7

```

O especificar la librería directamente:
```

Crea animaciones de entrada para los componentes. use library /framer/motion

```

Pero con la regla añadida, Claude Code debería buscar docs automáticamente cuando sea relevante.
```
