<div align="center">

# FitGame Pro

**Gamified Workout Tracker** — Turn every rep into XP, every PR into an achievement.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-2.94-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Overview

FitGame Pro is a full-stack workout tracking application with RPG-inspired gamification. It generates personalized training programs, tracks your progress with XP and levels, detects personal records in real-time, and works offline with automatic sync.

Built as a single-page application with a dark-themed UI optimized for gym use.

## Features

### Training System
- **Smart Onboarding** — 7-step guided setup that generates personalized workout templates based on your goal, experience, equipment, and availability
- **Template Generator** — Automatic split selection (Full Body / Upper-Lower / Push-Pull-Legs) with proper volume, RPE, and rest periods per experience level
- **Weekly Schedule** — Visual 7-day program editor with drag-and-drop assignment
- **Workout Player** — 2-column layout with exercise sidebar, set tracking, RPE logging, and built-in rest timer

### Gamification
- **XP System** — Earn XP per set (+5), RPE 9+ bonus (+10), PR bonus (+25), full completion bonus (+30)
- **Leveling** — Progress through tiers: Novice, Intermediate, Advanced, Elite
- **Streak Tracking** — Consecutive training day counter
- **Session Summary** — Animated XP breakdown with confetti on completion

### Progress Tracking
- **Personal Records** — Automatic PR detection and persistence
- **Activity Heatmap** — GitHub-style contribution calendar
- **Weekly Stats** — Workouts completed, total volume, XP earned
- **Session History** — Complete log of past workouts with volume metrics

### Offline Support
- **Offline Queue** — Operations are queued in localStorage when offline
- **Auto-Sync** — Automatic FIFO processing with exponential backoff on reconnection
- **Sync Indicator** — Real-time status display (Synced / Syncing / Offline)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.8 (strict mode) |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS (CDN) |
| Backend | Supabase (Auth + PostgreSQL) |
| Icons | Lucide React |
| Charts | Recharts |
| State | React Context API |
| Persistence | Supabase + localStorage fallback |

## Project Structure

```
fitgame-pro/
├── components/
│   ├── home/            # Dashboard components (WorkoutDayCard)
│   ├── progress/        # LevelBadge, XPBar
│   ├── session/         # ExerciseCard, SetCard, RestTimer, SessionSummary
│   ├── ui/              # Button, Card, Modal, Input, Badge
│   ├── workout/         # SetRow, AddExerciseModal
│   ├── Layout.tsx        # App shell with sidebar navigation
│   ├── DateSelector.tsx  # Horizontal date picker
│   └── SyncIndicator.tsx # Online/offline status
├── context/
│   └── AppContext.tsx    # Global state management
├── data/
│   ├── exerciseBlueprints.ts  # 35 exercises with muscle/equipment tags
│   └── mockData.ts            # Fallback data for offline mode
├── hooks/
│   ├── useOnlineStatus.ts     # Navigator.onLine + event listeners
│   ├── usePersist.ts          # localStorage persistence
│   ├── useRestTimer.ts        # Countdown timer with absolute timestamps
│   └── useSessionTimer.ts     # Workout duration tracker
├── lib/
│   ├── constants.ts           # Routes, XP values, storage keys
│   ├── sessionCalculations.ts # Volume, duration, completion utilities
│   ├── supabase.ts            # Supabase client initialization
│   ├── templateGenerator.ts   # Auto-generate templates + schedule
│   └── utils.ts               # cn() classname utility
├── pages/
│   ├── Dashboard.tsx      # Home with schedule, stats, calendar
│   ├── WorkoutPlayer.tsx  # Active workout session
│   ├── Schedule.tsx       # Weekly program editor
│   ├── Templates.tsx      # Template library
│   ├── TemplateEditor.tsx # Create/edit templates
│   ├── Onboarding.tsx     # 7-step guided setup
│   ├── Progress.tsx       # Heatmap, PRs, streaks
│   └── ExerciseLibrary.tsx # Exercise database browser
├── services/
│   ├── auth.ts            # Supabase authentication
│   ├── templates.ts       # Template CRUD operations
│   ├── workoutSessions.ts # Session persistence + PR queries
│   ├── offlineQueue.ts    # Offline operation queue
│   └── xp.ts              # XP calculation engine
├── supabase/
│   └── schema.sql         # Full database schema with RLS policies
└── types/
    ├── index.ts           # App-level type definitions
    └── database.ts        # Supabase-generated database types
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (optional — works offline with localStorage)

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

If using Supabase, run the schema in your SQL Editor:

```bash
# Copy the contents of supabase/schema.sql into
# Supabase Dashboard > SQL Editor > New Query > Run
```

This creates all tables (`profiles`, `templates`, `workout_sessions`, `personal_records`) with Row Level Security policies and auto-triggers.

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Architecture Highlights

- **Snapshot Pattern** — Session summary captures data before `activeWorkout` is nullified, using `useRef` to survive state transitions
- **Absolute Timestamps** — Rest timer uses `endTime` instead of countdown to handle browser tab throttling
- **Offline-First** — All Supabase operations have localStorage fallbacks; the offline queue processes FIFO with exponential backoff (max 5 retries)
- **Smart Splits** — Template generator selects training splits based on available days: Full Body (2-3), Upper/Lower (4), Push/Pull/Legs (5-6)

## License

This project is for portfolio/educational purposes.

---

<div align="center">
  <sub>Built by <a href="https://github.com/MiguelPCO">Miguel</a></sub>
</div>
