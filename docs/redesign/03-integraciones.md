# 03 — Integraciones: viabilidad desde una PWA

> Solo datos verificables en documentación oficial, con enlace. Lo que es criterio mío va marcado **[estimado]**. Consultado el 2026-09-23.

---

## Resumen ejecutivo

| Integración | ¿Viable desde PWA web? | Auth | Bloqueante principal |
|---|---|---|---|
| **Strava** | ✅ **Sí**, con un backend mínimo | OAuth 2.0 | El `client_secret` no puede vivir en el navegador; hace falta una función de servidor |
| **Apple Health** | ❌ **No** | — | HealthKit es solo framework nativo; no existe API web |
| **Google Health Connect** | ❌ **No** | — | SDK nativo de Android; no hay API REST |
| **Garmin Connect** | ⚠️ Técnicamente sí, pero **no elegible** | OAuth 2.0 | El programa es "only for business use" |

**Para el MVP: solo Strava, más registro manual.** Justificación al final del documento.

---

## 1. Strava API — ✅ viable

### Autenticación
OAuth 2.0. Autorización en `https://www.strava.com/oauth/authorize` (web) o `https://www.strava.com/oauth/mobile/authorize` (móvil); intercambio en `POST https://www.strava.com/oauth/token`.

- El `redirect_uri` debe caer **dentro del dominio de callback declarado en la aplicación**. `localhost` y `127.0.0.1` están en lista blanca, así que el desarrollo local funciona.
- Scopes disponibles: `read`, `read_all`, `profile:read_all`, `profile:write`, `activity:read`, `activity:read_all`, `activity:write`.
- **El access token caduca a las 6 horas.** Con refresh token se renueva; Strava avisa de que el valor del refresh token puede cambiar en cualquier renovación, así que hay que persistir el nuevo cada vez.
- **El `client_secret` es obligatorio** en el intercambio de token y, en palabras de Strava, "should never be shared".

Fuente: [developers.strava.com/docs/authentication](https://developers.strava.com/docs/authentication/)

> **Consecuencia directa para una PWA:** el intercambio de código por token **no puede hacerse desde el navegador**, porque expondría el `client_secret` a cualquiera que abra las DevTools. Hace falta un endpoint de servidor. En este proyecto ya hay Supabase, así que la solución barata es una **Supabase Edge Function** que guarde `client_secret` como secret del proyecto, haga el intercambio, guarde `access_token` / `refresh_token` / `expires_at` en una tabla con RLS, y renueve el token cuando caduque. No hace falta servidor propio ni app nativa **[estimado: es la opción de menor coste dado el stack actual, no una exigencia de Strava]**.

### Límites de uso
- Global: **200 peticiones cada 15 minutos, hasta 2.000 al día.**
- No-upload (lo que usaríamos para leer actividades): **100 cada 15 minutos, hasta 1.000 al día.**
- La ventana de 15 minutos se reinicia en los minutos 0, 15, 30 y 45 de cada hora; el límite diario, a medianoche UTC.
- Los límites son **por aplicación, no por usuario** — se comparten entre todos los atletas conectados. Superarlos devuelve `429`, y las infracciones cortas siguen contando para el total diario. Se puede pedir ampliación demostrando que se está cerca del techo.

Fuente: [developers.strava.com/docs/rate-limits](https://developers.strava.com/docs/rate-limits/)

> **Consecuencia de diseño:** con 1.000 lecturas al día compartidas entre toda la base de usuarios, **hacer polling por usuario no escala**. Hay que usar webhooks y tirar solo de la actividad concreta que Strava anuncia.

### Webhooks (push)
- **Una sola suscripción por aplicación**, pero esa suscripción recibe eventos de todos los atletas que hayan autorizado la app.
- Alta en dos pasos: se pide la suscripción y Strava hace un `GET` al callback con `hub.challenge`, `hub.verify_token` y `hub.mode`; hay que devolver `{"hub.challenge":"[valor]"}` **en menos de 2 segundos**.
- Cada `POST` de evento debe responderse con `200` **en menos de 2 segundos**.
- Eventos: creación, borrado y actualización de actividad (título, tipo, privacidad), y desautorización del atleta.

Fuente: [developers.strava.com/docs/webhooks](https://developers.strava.com/docs/webhooks/)

> El requisito de responder en 2 segundos descarta procesar la actividad dentro del propio webhook: hay que encolar y procesar aparte **[estimado]**.

### Restricciones legales que afectan al producto
Del acuerdo de API: *"Strava Data provided by a specific user can only be displayed or disclosed in your Developer Application to that user."* Es decir, **los datos de Strava de un usuario solo se le pueden mostrar a ese usuario**. La información públicamente visible de otros atletas no se puede mostrar sin permiso explícito. El uso de las marcas de Strava queda limitado a lo que digan sus Brand Guidelines. También se imponen "volume limits and other use restrictions" sin cifras concretas en ese documento.

Fuente: [strava.com/legal/api](https://www.strava.com/legal/api)

> **Consecuencia directa para la gamificación:** un ranking, un reto social o un feed que muestre a un usuario los kilómetros que otro ha importado desde Strava **incumple el acuerdo**. Los retos sociales de FitGame Pro (`social_challenges`) tendrían que alimentarse de datos que el propio usuario haya registrado en la app, o mostrar solo posiciones agregadas sin exponer el dato de origen Strava. Esto hay que decidirlo antes de construirlo.

---

## 2. Apple Health (HealthKit) — ❌ no viable desde web

HealthKit es "un repositorio central de datos de salud y fitness para iPhone, iPad, Apple Watch y Apple Vision Pro", accesible cuando el usuario da permiso a **tu app** para leer y escribir.

- Plataformas: iOS, iPadOS, watchOS, visionOS. **Solo apps nativas.**
- En la documentación de Apple **no hay ninguna mención a API web, acceso desde navegador ni acceso remoto**. Toda la superficie es de frameworks nativos (HealthKit, Core Motion, Core Location, WorkoutKit, Core Bluetooth).

Fuentes: [developer.apple.com/health-fitness](https://developer.apple.com/health-fitness/) · [developer.apple.com/documentation/healthkit](https://developer.apple.com/documentation/healthkit)

**Qué significa para una PWA:** una PWA instalada en iOS **no puede leer ni escribir en Salud**, ni con permisos del usuario. No hay workaround dentro del navegador. Las únicas vías reales son publicar una app nativa o un wrapper (Capacitor / React Native) que use HealthKit y sincronice con el backend **[estimado: son las vías conocidas; Apple no documenta ninguna otra]**.

---

## 3. Google Health Connect — ❌ no viable desde web

Health Connect es la plataforma central de datos de salud en Android (pasos, frecuencia cardíaca, sueño, rutas de ejercicio, y registros médicos en formato FHIR).

- **Acceso exclusivamente por SDK nativo de Android.** La biblioteca recomendada es Jetpack `androidx.health:health-connect`. **No existe API REST ni web.**
- Requisito mínimo: **Android SDK 28 (Android 9 Pie)** o superior, en dispositivos Android.
- Modelo de permisos por tipo de dato, gestionado por la propia UI de Health Connect; el usuario concede y revoca por app.

Fuente: [developer.android.com/health-and-fitness/guides/health-connect](https://developer.android.com/health-and-fitness/guides/health-connect)

### ¿Y la API REST de Google Fit como alternativa?
No sirve: **desde el 1 de mayo de 2024 no se admiten nuevas altas de desarrolladores** en las APIs de Google Fit, y Google ha anunciado su deprecación **en 2026**, dirigiendo a todo el mundo a Health Connect.

Fuente: [developers.google.com/fit/rest](https://developers.google.com/fit/rest)

**Qué significa para una PWA:** igual que Apple Health, una PWA en Android **no puede leer Health Connect**. Haría falta una app Android nativa o un wrapper.

---

## 4. Garmin Connect — ⚠️ técnicamente sí, pero no elegible

### Qué ofrece
La **Health API** da métricas de salud de todo el día: pasos, frecuencia cardíaca, sueño, estrés, calorías, respiración, composición corporal, pulsioximetría y resúmenes de actividad, en JSON. Permite elegir arquitectura **Ping/Pull o Push**, y suscribirse solo a los feeds que interesen.

Fuente: [developer.garmin.com/gc-developer-program/health-api](https://developer.garmin.com/gc-developer-program/health-api/)

### Acceso y autenticación
- **"All APIs in the Developer Program use OAUTH 2.0."**
- La solicitud se revisa **en dos días hábiles**; una integración típica lleva **entre 1 y 4 semanas**, con una llamada de integración.
- **"There are no licensing or maintenance fees for access"**, pero "access to some metrics may require a license fee payment or minimum device order quantity for commercial use".
- **El programa es "only for business use".** La FAQ no contempla proyectos personales o de hobby.

Fuente: [developer.garmin.com/gc-developer-program/program-faq](https://developer.garmin.com/gc-developer-program/program-faq/)

**Qué significa:** al ser REST server-to-server con OAuth 2.0, técnicamente encajaría igual que Strava (Edge Function + webhooks). El bloqueante no es técnico sino de elegibilidad: hay que ser una empresa y pasar por un proceso de aprobación con llamada incluida. **No es realista para el MVP** **[estimado, basado en el requisito "only for business use"]**.

---

## 5. Recomendación para el MVP

### Fase 1 — lo único que construiría ahora

1. **Registro manual de carrera** como ciudadano de primera clase, no como parche. Distancia, duración, ritmo medio, tipo de sesión y esfuerzo percibido. Funciona en todos los dispositivos, sin OAuth, sin cuotas, sin acuerdos legales, y es la base sobre la que se apoya cualquier importación posterior.
2. **Strava con OAuth 2.0 vía Supabase Edge Function**, con webhooks y con importación de la actividad concreta que anuncia el evento. Es la única de las cuatro que funciona de verdad en PWA.

### Por qué no las otras tres

- Apple Health y Health Connect exigen **app nativa**. Meterlas en el MVP no es "una integración más": obliga a cambiar la estrategia de distribución entera (Capacitor o React Native, cuentas de desarrollador, revisión de tiendas). Es una decisión de producto, no una tarea técnica.
- Garmin exige ser empresa y pasar aprobación. Se puede reevaluar cuando el producto tenga tracción.

### Restricciones que hay que respetar desde el día uno

1. **El `client_secret` de Strava nunca en el cliente.** Va en secrets de Supabase, se usa solo en la Edge Function.
2. **Nada de polling por usuario.** 1.000 lecturas diarias se agotan con ~30 usuarios haciendo polling cada media hora **[estimado: aritmética sobre el límite publicado]**. Webhooks y nada más.
3. **Los datos de Strava de un usuario solo se le muestran a ese usuario.** Los rankings y retos sociales se alimentan de datos registrados en la app, no de lo importado de Strava.
4. **Persistir el refresh token en cada renovación**, porque puede cambiar.
5. **URLs reales antes que OAuth.** El callback de Strava vuelve a una URL concreta; con el routing por estado actual (`App.tsx:81`, ver `00-estado-actual.md` §7.3) no hay ninguna URL a la que volver. **Migrar a rutas de verdad es prerrequisito de la integración**, no un extra de la fase de shell.

### Plan B honesto, si Apple Health acaba siendo imprescindible

Empaquetar la PWA con **Capacitor** y usar un plugin de HealthKit / Health Connect es el camino más corto desde este código, porque conserva React y el bundle actual **[estimado]**. Implica cuenta de desarrollador de Apple, revisión de App Store y mantener dos canales de distribución. No lo metería antes de validar que la gente pide esa sincronización.
