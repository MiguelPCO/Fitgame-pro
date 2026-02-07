# Sesión 2026-02-04 - Integración Supabase

## Objetivo

Integrar Supabase como backend para autenticación y persistencia de datos.

## Completado

- Instalado @supabase/supabase-js
- Creado cliente Supabase con soporte para modo offline
- Definido esquema de base de datos (profiles, templates, workout_sessions)
- Implementado RLS (Row Level Security) para todas las tablas
- Creado servicio de autenticación (signUp, signIn, signOut)
- Actualizado Login.tsx para usar Supabase Auth
- Creado Signup.tsx para registro de usuarios
- Actualizado App.tsx con flujo login/signup y loading state
- Migrado AppContext para sincronizar con Supabase
- Corregido bug de sincronización de XP (faltaba await en query)

## Archivos Creados

- `lib/supabase.ts` - Cliente Supabase con fallback offline
- `types/database.ts` - Tipos TypeScript para tablas de Supabase
- `supabase/schema.sql` - SQL para crear tablas, RLS y triggers
- `services/auth.ts` - Funciones de autenticación
- `pages/Signup.tsx` - Página de registro

## Archivos Modificados

- `.env.local` - Variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
- `pages/Login.tsx` - Integración con Supabase Auth + manejo de errores
- `App.tsx` - Flujo login/signup, loading state
- `context/AppContext.tsx` - Sincronización bidireccional con Supabase

## Decisiones Técnicas

- Fallback a localStorage si Supabase no está configurado (modo offline)
- Trigger automático para crear perfil al registrar usuario
- Avatar generado con DiceBear basado en user ID
- XP y stats se sincronizan a Supabase al completar workout

## Configuración Supabase

1. Crear proyecto en supabase.com
2. Ejecutar `supabase/schema.sql` en SQL Editor
3. Desactivar "Confirm email" en Authentication > Providers > Email (desarrollo)
4. Copiar URL y anon key a `.env.local`

## Bug Corregido

- La query de update de XP no se ejecutaba porque faltaba `await`
- Agregado manejo de errores con console.error

## Siguiente

- [ ] Verificar que XP persiste correctamente después del fix
- [ ] Sincronizar templates a Supabase
- [ ] Sincronizar workout_sessions a Supabase
- [ ] Sistema XP completo (PRs, bonuses)
