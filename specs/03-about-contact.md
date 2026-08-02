# Spec 03 — About / Contacto (envío de correo con Resend)

- **Estado:** Implementado
- **Dependencias:** Spec 01 (MVP Visual) — reutiliza `components/nav.tsx`, sistema de diseño en `app/globals.css`. Spec 02 (Home/Landing) — comparte carpeta de referencia `home-about/` pero es independiente.
- **Fecha:** 2026-08-02

**Objetivo:** Implementar la página `/about` (Acerca de + formulario de contacto) siguiendo el template `references/templates/home-about/about.jsx`, con el envío del formulario funcionando de verdad vía Server Action que llama a la API de Resend.

## Scope

**Dentro del alcance:**

- Nueva página `/about` (`app/about/page.tsx`) con las dos secciones del template:
  - Hero "Acerca de" (kicker, título, misión, 3 highlight cards)
  - Divider decorativo
  - Sección de contacto: intro + formulario (nombre, email, mensaje) con estados vacío → enviando → éxito → error
- Server Action (`app/about/actions.ts`, `'use server'`) que recibe los datos del formulario, valida en servidor (campos requeridos + formato de email) y llama a la API de Resend para enviar el correo
- Integración con Resend: dependencia `resend` en `package.json`, `RESEND_API_KEY` y `RESEND_TO_EMAIL` como variables de entorno, remitente `onboarding@resend.dev` (sandbox)
- `.env.local.example` con las claves necesarias documentadas (sin valores reales)
- Estados del formulario vía `useActionState`: envío en curso (botón deshabilitado/loading), éxito (mismo bloque "terminal" del template), error (mensaje inline, el usuario puede reintentar sin perder lo escrito)
- Validación en frontend igual al template (campos vacíos → shake) + validación de formato de email en el Server Action
- Nuevo link "Acerca de" en `components/nav.tsx` (desktop y móvil) → `/about`, resaltado como activo en esa ruta
- Estilos nuevos en `app/globals.css` para las secciones about/contact (hero, highlight cards, divider, contact grid, terminal-success, estado de error), reinterpretando el template con `/frontend-design` (no copiar `styles.css` literal, mismo criterio que specs 01 y 02)

**Fuera del alcance (queda para specs futuros):**

- Protección anti-spam (honeypot, captcha, rate limiting) — proyecto de portfolio sin tráfico real
- Dominio propio verificado en Resend (se usa sandbox `onboarding@resend.dev`)
- Persistencia de mensajes enviados (no se guarda historial en localStorage ni backend)
- Notificaciones adicionales (ej. copia de confirmación al remitente) — solo se envía el correo al equipo
- Tests automatizados

## Modelo de datos

No se introduce persistencia nueva (no hay tabla, no hay clave de `localStorage`). Solo tipos en memoria para el flujo de contacto:

**`ContactFormState`** (retorno del Server Action, consumido por `useActionState`):

```ts
type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;   // texto de error, ej. "Revisa el formato del correo"
  sentName?: string;  // nombre del remitente, para el bloque de éxito ("GRACIAS, {sentName}")
};
```

**Variables de entorno nuevas** (`.env.local`, documentadas en `.env.local.example`):

- `RESEND_API_KEY` — clave de la cuenta de Resend
- `RESEND_TO_EMAIL` — correo destino donde llegan los mensajes del formulario

## Plan de implementación

1. **Dependencia y entorno** — Agregar `resend` a `package.json` (`npm install resend`). Crear `.env.local.example` con `RESEND_API_KEY=` y `RESEND_TO_EMAIL=` (sin valores reales, comentados con su propósito).
2. **Server Action** — Crear `app/about/actions.ts` con `'use server'`: función `sendContactMessage(prevState, formData)` que valida nombre/email/mensaje no vacíos, valida formato de email con regex simple, llama a `resend.emails.send(...)` (from `onboarding@resend.dev`, to `process.env.RESEND_TO_EMAIL`, subject con el nombre del remitente, body con nombre/email/mensaje) y retorna un `ContactFormState` (`success` con `sentName`, o `error` con `message`).
3. **Estilos** — Usar `/frontend-design` para definir en `app/globals.css` las clases del hero about (kicker, highlight cards), divider, contact grid, terminal-success y un nuevo estado de error inline, reinterpretando `about.jsx`/`styles.css` del template con la paleta neón ya establecida.
4. **`app/about/page.tsx`** — Client Component: hero + highlight cards + divider (con hook `reveal` on-scroll vía `IntersectionObserver`, igual patrón que Home) + formulario de contacto usando `useActionState(sendContactMessage, {status:"idle"})`, validación de campos vacíos en frontend (shake), estado de envío (botón loading/disabled vía `useFormStatus` o `pending` de `useActionState`), estado de éxito (bloque terminal) y estado de error (mensaje inline + permite reintentar).
5. **Nav** — Actualizar `components/nav.tsx`: agregar link "Acerca de" → `/about` en desktop y panel móvil, resaltado activo cuando la ruta es `/about`.
6. **Verificación funcional** — Configurar una `RESEND_API_KEY` real de prueba, enviar un mensaje real desde `/about` y confirmar que llega a `RESEND_TO_EMAIL`; probar caso de error (ej. API key inválida temporalmente) y confirmar que el formulario muestra el error sin perder los datos escritos; revisar responsive desktop/mobile comparando con el template.

## Criterios de aceptación

- [ ] `/about` muestra el hero (título, misión, 3 highlight cards), divider y sección de contacto, con el lenguaje visual definido vía `/frontend-design`.
- [ ] El link "Acerca de" aparece en el `Nav` (desktop y móvil), apunta a `/about` y se resalta como activo en esa ruta.
- [ ] Enviar el formulario con campos vacíos dispara el shake y no llama al Server Action.
- [ ] Enviar el formulario con datos válidos muestra el estado "enviando" (botón deshabilitado/loading) y, si Resend responde OK, muestra el bloque de éxito con el nombre del remitente.
- [ ] El correo enviado llega efectivamente a la dirección configurada en `RESEND_TO_EMAIL`, con nombre, email y mensaje del remitente.
- [ ] Si Resend falla o el email tiene formato inválido, el formulario muestra un mensaje de error inline y conserva los datos escritos para reintentar.
- [ ] `RESEND_API_KEY` y `RESEND_TO_EMAIL` no están hardcodeados en el código; `.env.local.example` documenta ambas variables.
- [ ] El diseño es responsive en desktop y mobile.

## Decisiones tomadas y descartadas

- **Server Action en vez de Route Handler:** el form no necesita headers/status codes custom, y Server Actions integra mejor con `useActionState` para manejar loading/error/success sin fetch manual. Se descartó `app/api/contact/route.ts`.
- **Sandbox `onboarding@resend.dev` en vez de dominio propio:** no hay dominio verificado en Resend todavía; el sandbox permite que el envío funcione de inmediato sin bloquear el spec por configuración externa. Se descartó exigir verificación de dominio como prerequisito.
- **Sin protección anti-spam:** proyecto de portfolio/curso sin tráfico real, agregar honeypot o captcha es sobre-ingeniería para el alcance actual. Se descartó honeypot.
- **Sin copia de confirmación al remitente:** el template solo modela "recibimos tu mensaje" en la UI, no un correo de vuelta al usuario; agregar un segundo envío duplica lógica sin que se haya pedido. Se descartó el correo de confirmación.
- **Validación de email también en servidor:** el input `type="email"` del frontend es fácil de saltarse (Server Actions son un POST público, ver docs de Next 16 sobre Server Actions), así que se agrega regex simple antes de llamar a Resend. Se descartó confiar solo en la validación HTML5.

## Riesgos identificados

- **`RESEND_API_KEY` ausente o inválida en producción:** el envío fallaría silenciosamente para todo usuario. Mitigación: el estado de error del formulario ya cubre este caso a nivel UX; el `.env.local.example` deja documentada la variable requerida para el deploy.
- **Rotación de Server Action IDs entre deploys:** Next.js 16 rota los IDs de Server Actions en cada deploy (hasta cada 14 días aunque el código no cambie); un usuario con la página abierta desde antes del deploy puede ver "Failed to find Server Action" al enviar. Mitigación: el estado de error del formulario permite reintentar, lo cual en la práctica resuelve el caso con un refresh de página.
- **Sandbox de Resend limitado:** `onboarding@resend.dev` puede tener límites de envío o restricciones de destinatario propios del modo sandbox de Resend. Mitigación: fuera de alcance resolverlo ahora: si se topa un límite, el spec de seguimiento (dominio verificado) lo atiende.
