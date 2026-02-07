# Sesión: Recommended Weight System + Historial de Sesiones
**Fecha:** 2026-02-07

## Resumen
Implementación de dos features principales:
1. **Sistema de peso recomendado** con double progression automática
2. **Página de historial** con filtros y detalle expandible

---

## Feature 1: Recommended Weight System

### Archivos nuevos
- `lib/weightRecommendation.ts` — Lógica de double progression

### Archivos modificados
- `context/AppContext.tsx` — `startSessionFromTemplate` pre-rellena pesos desde historial
- `components/session/SetInputModal.tsx` — Badge "Sugerido: X kg" clickable
- `components/session/SetCard.tsx` — Peso sugerido en gris para sets pendientes
- `components/session/ExerciseCard.tsx` — Pasa `recommendedWeight` a SetCard
- `pages/WorkoutPlayer.tsx` — Pasa `recommendedWeight` a SetInputModal

### Lógica Double Progression
1. Busca última sesión completada con ese ejercicio
2. Extrae top sets (no warmup) completados
3. Si todas las reps alcanzaron tope del rango → +2.5kg
4. Si reps dentro del rango → mismo peso
5. Si reps por debajo en 2+ sets → -2.5kg
6. Warmup = 60% del peso top-set

---

## Feature 2: Historial de Sesiones

### Archivos nuevos
- `pages/History.tsx` — Página completa de historial

### Archivos modificados
- `lib/constants.ts` — `ROUTES.HISTORY`
- `App.tsx` — Ruta para History
- `components/Layout.tsx` — Nav item "Historial" con icono History

### Funcionalidades
- Header con stats (total sesiones, volumen total)
- Barra de búsqueda por nombre de sesión
- Filtro por grupo muscular (pills horizontales)
- Cards de sesión con fecha, duración, volumen, XP
- Detalle expandible con ejercicios y sets (peso x reps @ RPE)
- Empty state para sin sesiones / sin resultados

---

## Verificación
- `npx tsc --noEmit` → 0 errores
- `npx vite build` → build exitoso
