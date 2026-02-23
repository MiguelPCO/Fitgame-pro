<div align="center">

# FitGame Pro

**Gamified Workout Tracker** — Turn every rep into XP, every PR into an achievement.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-2.94-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/tests-138%20passing-brightgreen)](https://vitest.dev)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

</div>

---

## Overview

FitGame Pro is a full-stack workout tracking application with RPG-inspired gamification. It generates personalized training programs, tracks your progress with XP and levels, detects personal records in real-time, and works fully offline with automatic sync when back online.

Built as a progressive web app (PWA) with a dark-themed UI optimized for in-gym use.

## Features

### Training System
- **Smart Onboarding** — 7-step guided setup that generates personalized workout templates based on your goal, experience, equipment, and weekly availability
- **Template Generator** — Automatic split selection (Full Body / Upper-Lower / Push-Pull-Legs) with proper volume, RPE, and rest periods per experience level
- **Preset Programs** — 5 pre-built programs (PPL, Upper/Lower, Full Body 3×, 5/3/1, Bro Split) adoptable with one tap
- **Weekly Schedule** — Visual 7-day program editor with session assignment
- **Workout Player** — 2-column layout with exercise sidebar, set tracking, RPE logging, and built-in rest timer
- **Progressive Overload** — Automatic weight recommendations from personal history (double-progression model)
- **Exercise Library** — 67 exercises tagged by muscle group and equipment

### Gamification
- **XP System** — Earn XP per set (+5), RPE 9+ bonus (+10), PR bonus (+25), full completion bonus (+30)
- **Leveling** — Progress through tiers: Novice → Intermediate → Advanced → Elite
- **Badges / Achievements** — 20+ milestone badges (first workout, streak milestones, PRs, volume goals)
- **Streak Tracking** — Consecutive training day counter with freeze mechanic (2 free freezes/month)
- **Weekly Challenges** — Auto-generated weekly goals with XP rewards and progress tracking
- **Session Summary** — Animated XP breakdown with confetti on completion

### Progress & Analytics
- **Personal Records** — Automatic PR detection and persistence with history chart by exercise
- **Muscle Fatigue Heatmap** — Exponential-decay model showing which muscle groups need rest
- **Activity Calendar** — GitHub-style contribution heatmap
- **Weekly Stats** — Workouts completed, total volume, XP earned, streak
- **Session History** — Complete log of past workouts with volume metrics and search/filter
- **Data Export** — CSV and JSON export of full workout history

### Social
- **Friend Challenges** — Create or join challenges by 6-character code; track leaderboard progress in real time
- **Share Workouts** — Share PRs, badges, and weekly summaries via Web Share API or clipboard

### Offline & PWA
- **Offline Queue** — Operations are queued in localStorage when offline
- **Auto-Sync** — Automatic FIFO processing with exponential backoff on reconnection
- **Sync Indicator** — Real-time status display (Synced / Syncing / Offline)
- **PWA Install** — Installable to home screen with full offline support
- **Push Notifications** — Workout reminders and streak-at-risk alerts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.8 (strict mode) |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3 (PostCSS build) |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Icons | Lucide React |
| Charts | Recharts |
| State | React Context API |
| Persistence | Supabase + localStorage fallback |
| PWA | vite-plugin-pwa (Workbox) |
| Tests | Vitest + React Testing Library + Playwright |

## Project Structure

```
fitgame-pro/
├── components/
│   ├── home/            # WorkoutDayCard
│   ├── progress/        # LevelBadge, XPBar
│   ├── session/         # ExerciseCard, SetCard, RestTimer, SessionSummary
│   ├── ui/              # Button, Card, Modal, Input, Badge, Toast, Skeleton
│   ├── workout/         # AddExerciseModal
│   ├── Layout.tsx        # App shell with sidebar navigation
│   ├── DateSelector.tsx  # Horizontal date picker
│   ├── SyncIndicator.tsx # Online/offline status
│   ├── ErrorBoundary.tsx # React error boundary
│   ├── InstallBanner.tsx # PWA install prompt
│   └── WeeklySummaryModal.tsx
├── context/
│   └── AppContext.tsx    # Global state management
├── data/
│   ├── exerciseBlueprints.ts  # 67 exercises with muscle/equipment tags
│   ├── mockData.ts            # Fallback data for offline mode
│   └── presetPrograms.ts      # 5 pre-built training programs
├── hooks/
│   ├── useOnlineStatus.ts     # Navigator.onLine + event listeners
│   ├── usePersist.ts          # localStorage persistence
│   ├── useRestTimer.ts        # Countdown timer with absolute timestamps
│   └── useSessionTimer.ts     # Workout duration tracker
├── lib/
│   ├── badges.ts              # 20+ badge definitions + unlock logic
│   ├── calculations.ts        # 1RM (Epley), volume, muscle fatigue score
│   ├── challenges.ts          # Weekly challenge generation + evaluation
│   ├── constants.ts           # Routes, XP values, storage keys
│   ├── dateUtils.ts           # Shared date formatting utilities
│   ├── logger.ts              # Dev-only logger (no console.* in prod)
│   ├── notifications.ts       # Push notification helpers
│   ├── share.ts               # Web Share API utilities
│   ├── supabase.ts            # Lazy Supabase singleton
│   ├── templateGenerator.ts   # Auto-generate templates + schedule
│   ├── utils.ts               # cn() classname utility
│   └── weeklySummary.ts       # Weekly summary data aggregation
├── pages/
│   ├── Dashboard.tsx      # Home: schedule, stats, fatigue heatmap, badges
│   ├── WorkoutPlayer.tsx  # Active workout session
│   ├── Schedule.tsx       # Weekly program editor
│   ├── Templates.tsx      # Template library
│   ├── TemplateEditor.tsx # Create/edit templates
│   ├── Onboarding.tsx     # 7-step guided setup
│   ├── Progress.tsx       # PRs, history chart, calendar, 1RM
│   ├── History.tsx        # Full session log with search/filter
│   ├── Programs.tsx       # Pre-built program browser + adoption
│   ├── Challenges.tsx     # Social challenge hub
│   ├── Settings.tsx       # Profile, preferences, data export
│   ├── ExerciseLibrary.tsx # Exercise database browser
│   └── WorkoutSummary.tsx # Post-workout summary with XP breakdown
├── services/
│   ├── auth.ts              # Supabase authentication + password reset
│   ├── socialChallenges.ts  # Challenge CRUD + progress sync
│   ├── templates.ts         # Template CRUD operations
│   ├── workoutSessions.ts   # Session persistence + PR queries
│   ├── offlineQueue.ts      # Offline operation queue
│   └── xp.ts               # XP calculation engine
├── supabase/
│   └── migrations/         # Timestamped SQL migration files
├── public/
│   └── sw-notifications.js # Custom service worker for push notifications
└── types/
    ├── index.ts           # App-level type definitions
    └── database.ts        # Supabase database types
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (optional — works fully offline with localStorage)

### Installation

```bash
git clone https://github.com/MiguelPCO/Fitgame-pro.git
cd Fitgame-pro
npm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** The app works fully offline without Supabase. All data is persisted to localStorage.

### Database Setup (Optional)

If using Supabase, run the migrations in order from `supabase/migrations/` in your SQL Editor.

### Development

```bash
npm run dev          # Start dev server at http://localhost:5173
npm run test         # Run unit tests (Vitest)
npm run test:e2e     # Run E2E tests (Playwright)
npm run type-check   # TypeScript strict check
```

### Production Build

```bash
npm run build
npm run preview
```

## Architecture Highlights

- **Snapshot Pattern** — Session summary captures data before `activeWorkout` is nullified, using `useRef` to survive state transitions
- **Absolute Timestamps** — Rest timer uses `endTime` instead of countdown to handle browser tab throttling
- **Offline-First** — All Supabase operations have localStorage fallbacks; the offline queue processes FIFO with exponential backoff (max 5 retries)
- **Lazy Supabase** — `getSupabase()` async singleton prevents duplicate client instantiation; startup JS reduced from 430 → 256 kB
- **Code Splitting** — All pages lazy-loaded with `React.lazy` + `Suspense`; page-specific skeleton loaders
- **Fatigue Model** — Exponential decay: `score = exp(−daysAgo × 0.4)`, half-life ~1.7 days; 4 fatigue levels per muscle group

## License

[MIT](./LICENSE)

---

<div align="center">
  <sub>Built by <a href="https://github.com/MiguelPCO">Miguel</a></sub>
</div>
