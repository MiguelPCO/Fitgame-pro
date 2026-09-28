# Seguridad — 18/09/2026

## Bloque 🟠 — 18/09/2026

### Hecho
- **XP, nivel, racha y tier se escribían desde el cliente** (`update profiles set xp = …`). `revoke update (xp, …)` no sirve si hay GRANT UPDATE de tabla → migración: `revoke insert, update on profiles` y `grant update` solo de las 8 columnas de preferencias (nombre, objetivo, días, minutos, material, experiencia, onboarding, horario). Nueva RPC `complete_workout(session_id, tz)`: replica `calculateWorkoutXP` + `calculateNewUserStats` a partir de la fila de la sesión y de `personal_records`, con tope de 1500 XP por sesión y 3000 XP en 24 h. Es idempotente (`workout_sessions.xp_awarded_at`).
- `AppContext.completeSession`: guarda la sesión → llama a `awardWorkoutXP` (RPC) → guarda los PR (después, para que el servidor compare con los anteriores). La UI sigue siendo optimista y se reconcilia con lo que devuelve el servidor (perfil y `xpReward` de la sesión).
- **`xp_reward` llegaba del cliente**: fuera del INSERT (grant por columnas en `workout_sessions`). UPDATE solo de nombre, duración, músculos y notas (la app solo edita notas). DELETE retirado: borrar y reinsertar sesiones saltaba el tope diario (el borrado sigue funcionando con `delete_user_account`).
- **Progreso de retos falsificable**: `challenge_participants` sin INSERT/UPDATE para el cliente. `refresh_challenge_progress()` lo calcula igual que `computeProgress` (sesiones / volumen / racha), para todos los participantes de tus retos activos. La página de Retos llama a la RPC y luego recarga.
- **Retos visibles y unibles por cualquiera**: SELECT solo para participantes y creador (`is_challenge_member`). Crear con `create_challenge` y unirse con `join_challenge(code)`; sin INSERT directo. `bonus_xp` con CHECK 0–1000. `creator_name`/`user_name` los pone un trigger desde `profiles`. El código se genera en la BD con `gen_random_uuid()` (antes `Math.random`).
- **Cabeceras** en `vercel.json`: X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS y CSP en **Report-Only** (Supabase https+wss, Turnstile, DiceBear, Unsplash, YouTube, picsum; hash del script de tema de `index.html`). JSON no admite comentarios: **pasarla a `Content-Security-Policy` cuando la consola esté limpia**. Si se cambia el script inline de `index.html`, recalcular su hash.
- **Google Fonts → propio dominio**: Inter (latin + latin-ext, fuente variable 400–900) en `public/fonts`, `@font-face` en `index.css`, quitada del `<head>`, del caché del service worker y de la política de privacidad.
- `handle_new_user` con `search_path = ''`. Guarda `profiles.health_consent_at` (hora del servidor si el alta trae el consentimiento; no editable). Las altas anteriores se copian de `user_metadata`. Esto resuelve el segundo punto de «Falta» de la sección Legal.
- Contraseña mínima 8 en el registro.
- Arreglado de paso: `getMyChallenges` pedía `challenge_participants(*)` pero la UI lee `participants` → la clasificación salía siempre vacía. Ahora `participants:challenge_participants(*)`.
- Modo demo sin `VITE_SUPABASE_*`: **no se toca**. Es intencional (README: «works fully offline without Supabase») y los E2E dependen de él.

### Aplicar (en este orden)
1. Supabase → SQL Editor → `supabase/migrations/20260918000000_server_side_progress.sql` (entera). Ejecutar las consultas de comprobación del final.
2. Desplegar el cliente justo después. Entre 1 y 2, el cliente viejo no puede guardar sesiones (manda `xp_reward`), ni XP, ni crear/unirse a retos: fallan con error y la app sigue en local.

### Qué probar
- Terminar un entreno: la XP y el nivel suben igual que antes; en la tabla, `xp_awarded_at` relleno y `xp_reward` igual al de la pantalla (salvo tope).
- Consola del navegador: `update profiles set xp` o `update challenge_participants set progress` → error 42501.
- Otro usuario sin código no ve el reto; con el código se une y aparece en la clasificación.
- Racha: entrenar dos días seguidos → +1.
- DevTools → Network: ninguna petición a `fonts.googleapis.com` / `fonts.gstatic.com`. Consola: avisos `[Report Only]` de la CSP.

### Queda pendiente
- Las sesiones siguen siendo autodeclaradas (series, pesos y reps los manda el cliente). El servidor no puede saber si entrenaste; lo que se ha cerrado es escribir la XP o el progreso a mano. Los topes (1500/sesión, 3000/24 h; retos: 3 sesiones al día, serie ≤ 500 kg × 100 reps, ≤ 100 t por sesión) limitan cuánto se gana inventando sesiones.
- `personal_records` sigue siendo editable por el usuario: borrando sus PR puede volver a cobrar el bonus de PR (+25 por ejercicio), dentro de los topes.
- `p_tz` lo manda el cliente: cambiarlo da como mucho el bonus de mañana (+20 %) y ~1 día de margen en la racha.
- El reto semanal local (`lib/challenges.ts`) y los freezes de racha siguen siendo solo locales (no dan XP en el servidor).
- Código de reto de 6 caracteres sin límite de intentos en la RPC (≈ 10⁹ combinaciones).
- Si guardar la sesión falla (sin red), la XP local no llega al servidor y se pierde al recargar el perfil. Antes se perdía la sesión pero no la XP.
- Imágenes de `images.unsplash.com` e `img.youtube.com` también envían la IP a terceros y no están en la política de privacidad.
- 🟢 sin tocar (otros archivos): imagen OG en PNG con URL absoluta (`index.html`), `npm audit fix` (`ws`).

### Checks
- `tsc --noEmit`: limpio.
- Tests unitarios: 198/199 (+2 nuevos en `services/workoutSessions.test.ts`). Sigue fallando solo `lib/periodization.test.ts` (previo).
- `eslint .`: 1 error previo (`Dashboard.tsx:375`), 9 warnings previos (antes 10: se fue un import sin usar). Ninguno nuevo.
- `vite build`: OK.
- E2E: 30 pasan, 2 skip, los mismos 6 fallos previos.

## Legal y CAPTCHA

### Hecho
- `lib/legal.ts`: datos del titular. Páginas en `pages/Legal.tsx`.
- La app no tiene router (navegación por estado en `App.tsx`). `/privacidad` y `/aviso-legal` se resuelven por `window.location.pathname` en `App` **antes** de comprobar la sesión, así que son públicas. `vercel.json` ya reescribe todo a `index.html`.
- Enlaces: pie del login, pie de Ajustes → Cuenta, y «Al crear una cuenta aceptas…» bajo el botón de registro.
- **Datos de salud** (entrenamientos, pesos, repeticiones, récords, objetivo físico): casilla obligatoria en el registro, sin marcar, con `required` y comprobación en `handleSubmit`. La fecha se guarda en `options.data.health_consent_at` del `signUp` → `auth.users.raw_user_meta_data`.
- Turnstile (`components/Turnstile.tsx`) en todos los formularios que llaman a métodos con CAPTCHA: registro (`signUp`), login (`signInWithPassword`), «¿Olvidaste tu contraseña?» y «Cambiar contraseña» de Ajustes (los dos `resetPasswordForEmail`). El token va en `captchaToken`; el widget se remonta tras cada intento. Sin `VITE_TURNSTILE_SITE_KEY` no se pinta nada y los botones funcionan igual que antes.
- `.env.example`: `VITE_TURNSTILE_SITE_KEY=`.
- No hay CSP (ni en `vercel.json` ni en `index.html`): nada que tocar.
- Proveedores en la política: Supabase, Vercel, Cloudflare Turnstile, Google Fonts, DiceBear. No hay analítica ni cookies que no sean técnicas.

### Checks
- `tsc --noEmit`: limpio.
- Tests unitarios: 196/197. Falla `lib/periodization.test.ts > countTrainingWeeksInPhase > returns 1 for 3 sessions in the same week`, **ya fallaba antes** (comprobado con `git stash`). Ojo: `vitest` también recoge los tests de `.worktrees/`; usa `--exclude ".worktrees/**"`.
- `eslint`: 1 error previo (`pages/Dashboard.tsx:375`, `useStreakFreeze` dentro de un callback) y 10 warnings previos. Ninguno nuevo.
- `vite build`: OK.
- E2E (Playwright, modo offline sin Supabase): 30 pasan, 2 skip, 6 fallan **igual que antes** de los cambios (dashboard, navigation, workout; nada de auth).

### Miguel tiene que hacer (en este orden)
1. Rellenar apellidos, NIF y domicilio en `lib/legal.ts`, y la región de Supabase en `/privacidad` (buscar `[RELLENAR]`).
2. Cloudflare → Turnstile → crear widget con el dominio de producción y `localhost`.
3. Vercel → `VITE_TURNSTILE_SITE_KEY` = site key → redeploy (va horneada en el build).
4. Supabase → Authentication → Attack Protection → activar CAPTCHA con Turnstile y la secret key.

### Falta
- El consentimiento de salud solo se valida en el cliente: el registro va directo a Supabase, sin servidor propio. Si se quiere blindar, un trigger en `auth.users` que rechace altas sin `health_consent_at`.
- `health_consent_at` vive en `user_metadata`, que el propio usuario puede editar con `updateUser`. Para un registro fiable de cuándo se consintió, copiarlo a una columna de `profiles` en el trigger de alta.
- Google Fonts se carga desde los servidores de Google (envía la IP del usuario). Servir Inter desde el propio dominio lo evita y permite quitarlo de la política.
- Los avatares se piden a `api.dicebear.com` con el id del usuario como semilla. Generarlos en local o con iniciales lo evita.
