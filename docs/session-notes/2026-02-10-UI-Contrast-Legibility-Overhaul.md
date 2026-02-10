# Sesión 2026-02-10 - UI Contrast & Legibility Overhaul

## 🎯 Objetivo

Corregir todos los problemas de contraste y legibilidad en el tema oscuro en un solo pase.

## ✅ Completado

- Bumped `text-muted` en tailwind.config.js: `#94a3b8` → `#cbd5e1` (slate-300)
- Reemplazado `text-gray-500` → `text-gray-400` en 20 archivos (~43 ocurrencias)
- Reemplazado `text-gray-600` → `text-gray-400` en 8 archivos (~16 ocurrencias)
- Reemplazado `text-gray-700` → `text-gray-500` en 5 archivos (~5 ocurrencias)
- Fix `text-gray-800` → `text-gray-500` en RestTimer.tsx (SVG circle stroke)
- Fix placeholder: `placeholder:text-gray-600` → `placeholder:text-gray-500` en History.tsx
- Card border: `border-gray-800` → `border-gray-700` en Card.tsx (global)
- Modal footer border: `border-gray-800` → `border-gray-700` en Modal.tsx
- Badge opacity bump: `/10` → `/20` en Badge.tsx (success, warning, danger, info)
- Muscle badge opacity: `/15` → `/25` en ExerciseCard.tsx y History.tsx (MUSCLE_COLORS)
- SetCard type badges: `/15` → `/25` (warmup, top, backoff)
- PRBadge opacity: `/15` → `/25` (icon bg + improvement badge)
- Min font size: `text-[9px]` → `text-[10px]` en SetCard.tsx (2 ocurrencias)

## 📁 Archivos tocados

- `tailwind.config.js` - text-muted color bump
- `components/ui/Card.tsx` - border contrast
- `components/ui/Modal.tsx` - footer border contrast
- `components/ui/Badge.tsx` - badge opacity bump
- `components/session/SetCard.tsx` - text, badges, font size
- `components/session/RestTimer.tsx` - SVG stroke, text
- `components/session/ExerciseCard.tsx` - text, muscle badges
- `components/session/ExerciseSidebar.tsx` - text colors
- `components/session/SetInputModal.tsx` - text colors
- `components/session/SessionSummary.tsx` - text colors
- `components/session/SessionStats.tsx` - text colors
- `components/session/RPESlider.tsx` - text colors
- `components/session/PRBadge.tsx` - badge opacity
- `components/workout/AddExerciseModal.tsx` - text colors
- `components/home/WorkoutDayCard.tsx` - text colors
- `components/Layout.tsx` - nav icon, breadcrumb, separator
- `components/ErrorBoundary.tsx` - error message text
- `pages/` - All 8 page files updated

## 💡 Decisiones técnicas

- NO se tocaron: `bg-primary/10` (nav active states), button hovers, XP popup backgrounds
- `text-[10px]` y `text-[11px]` no se cambiaron globalmente (solo el extremo 9px)
- `placeholder:text-gray-500` es el mínimo legible para placeholders en dark bg

## ⏭️ Siguiente

- [ ] Visual QA: abrir app y verificar todas las páginas
- [ ] Push a GitHub
- [ ] Deploy a Vercel
