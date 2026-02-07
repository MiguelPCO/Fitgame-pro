# Sesión 2026-02-04 - Refactor de Estructura del Proyecto

## Objetivo

Refactorizar la estructura del proyecto para reducir duplicación, mejorar mantenibilidad y preparar para backend.

## Completado

- Creada arquitectura de carpetas: `/lib`, `/hooks`, `/services`, `/types`, `/components/ui`
- Implementados componentes UI reutilizables (Button, Card, Input, Modal, Badge)
- Extraída lógica de utilidades a `lib/utils.ts` (cn, formatTime, formatDate)
- Creadas constantes centralizadas en `lib/constants.ts` (ROUTES, XP, STORAGE_KEYS)
- Extraídos hooks: `useSessionTimer`, `usePersist`, `useRestTimer`
- Extraídos servicios: `audio.ts` (playNotification), `xp.ts` (calculateNewUserStats)
- Migrados tipos a `/types/index.ts` con re-export de compatibilidad

## Archivos Creados

- `components/ui/Button.tsx` - Botón con variants (primary, secondary, ghost, danger, success)
- `components/ui/Card.tsx` - Card con padding y hover opcionales
- `components/ui/Input.tsx` - Input con leftIcon y centered
- `components/ui/Modal.tsx` - Modal reutilizable con sizes
- `components/ui/Badge.tsx` - Badge con variants de color
- `lib/constants.ts` - ROUTES, XP, STORAGE_KEYS, DEFAULT_SET_CONFIG
- `lib/utils.ts` - cn(), formatTime(), formatDate()
- `hooks/useSessionTimer.ts` - Timer de duración de sesión
- `hooks/usePersist.ts` - loadFromStorage helper
- `hooks/useRestTimer.ts` - Lógica de rest timer (disponible para uso futuro)
- `services/audio.ts` - playNotification(), triggerHapticFeedback()
- `services/xp.ts` - calculateNewUserStats()
- `types/index.ts` - Tipos centralizados

## Archivos Modificados

- `App.tsx` - Usa ROUTES constants en lugar de strings
- `AppContext.tsx` - Usa STORAGE_KEYS, importa audio/xp services
- `WorkoutPlayer.tsx` - Usa Button, Card, formatTime, useSessionTimer
- `types.ts` - Re-exporta desde types/index.ts (compatibilidad)

## Decisiones Técnicas

- API de componentes con props tipadas (variant, size) vs className override
- Mantener compatibilidad con `types.ts` existente via re-export
- Hooks de timer mantienen lógica de endTime absoluto para background reliability

## Siguiente

- [ ] Actualizar Dashboard.tsx para usar Button, Card
- [ ] Actualizar Onboarding.tsx para usar Input, Button
- [ ] Actualizar Templates.tsx para usar Card, Badge
- [ ] Actualizar ExerciseLibrary.tsx para usar Modal, Card, Badge
- [ ] Fase 3: Extraer sub-componentes de WorkoutPlayer (SetRow, AddExerciseModal)
- [ ] Integración con Supabase para backend
