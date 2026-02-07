# Sesión 2026-02-04 - Extracción de Sub-componentes

## Objetivo

Extraer sub-componentes de WorkoutPlayer y verificar migración de componentes UI en todas las páginas.

## Completado

- Verificado que Dashboard, Onboarding, Templates y ExerciseLibrary ya usan componentes UI
- Extraído SetRow a `/components/workout/SetRow.tsx`
- Extraído AddExerciseModal a `/components/workout/AddExerciseModal.tsx`
- Creado barrel export en `/components/workout/index.ts`
- WorkoutPlayer reducido de ~520 a ~305 líneas

## Archivos Creados

- `components/workout/SetRow.tsx` - Componente de fila de set con inputs, estados y menú expandible
- `components/workout/AddExerciseModal.tsx` - Modal de búsqueda y selección de ejercicios
- `components/workout/index.ts` - Re-exports

## Archivos Modificados

- `pages/WorkoutPlayer.tsx` - Eliminados sub-componentes inline, añadidos imports

## Decisiones Técnicas

- Mantener imports de mockData en AddExerciseModal (se migrará cuando se implemente Supabase)
- SetRow mantiene su lógica de estado local para inputs decimales

## Siguiente

- [ ] Integración Supabase (auth + database)
- [ ] Migrar de localStorage a Supabase
- [ ] Sistema XP completo (PRs, bonuses, streaks)
