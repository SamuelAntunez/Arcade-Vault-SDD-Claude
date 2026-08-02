# Spec 02 — Home / Landing Page

- **Estado:** Aprobado
- **Dependencias:** Spec 01 (MVP Visual) — reutiliza `lib/data.ts`, `SessionProvider`, `components/nav.tsx` y el sistema de diseño ya definido en `app/globals.css`.
- **Fecha:** 2026-08-02

**Objetivo:** Implementar la landing page (`/`) de Arcade Vault con el lenguaje visual del template `references/templates/home-about/home.jsx` (hero, features, rail de juegos, stats, actividad en vivo derivada de datos reales, pricing y CTA final), moviendo la Biblioteca actual de `/` a `/biblioteca` y actualizando el `Nav` y los enlaces internos que dependían de la ruta anterior.

## Scope

**Dentro del alcance:**

- Nueva landing page en `/` (`app/page.tsx`, Client Component) con las secciones del template:
  - Hero (título, subtítulo, CTAs "Explorar juegos" / "Crear cuenta", siluetas decorativas flotantes)
  - "¿Por qué Arcade Vault?" (4 feature cards con iconos pixel)
  - Rail de juegos disponibles (6 primeros de `GAMES`, link a `/juego/[id]`)
  - Stats (`GAMES.length` real para "juegos"; "MILES DE PARTIDAS" y "GLOBAL RANKING" decorativos fijos)
  - Actividad en vivo: "Últimas puntuaciones" y "Top jugadores · hoy", ambas derivadas de `seededScores` (determinista, sin backend)
  - Pricing (plan único gratuito) + FAQ
  - CTA final
  - Animaciones `reveal` on-scroll (`IntersectionObserver`), igual patrón que el template
- Biblioteca actual se mueve de `app/page.tsx` a `app/biblioteca/page.tsx` (ruta `/biblioteca`), sin cambios funcionales respecto a spec 01
- Actualización de `components/nav.tsx`: logo → `/`, nuevo link "Inicio" → `/`, "Biblioteca" → `/biblioteca` (activo también en `/juego/*`)
- Actualización de enlaces/redirects existentes que apuntaban a `/` como biblioteca: botones "Volver al vault" en `/juego/[id]`, `/juego/[id]/jugar`, `/salon`, y el redirect post-login en `/login` → todos pasan a `/biblioteca`
- Estilos nuevos en `app/globals.css` para las secciones del home (hero, features, mini-rail, stats, activity, pricing, final CTA), diseñados con `/frontend-design` reinterpretando el template (no copiar `styles.css` literal, consistente con spec 01)

**Fuera del alcance (queda para specs futuros):**

- Página "Acerca de" / contacto (`about.jsx`) — spec separado
- Cualquier dato real de actividad/telemetría (todo sigue siendo mock determinista, sin backend)
- Cambios al modelo de datos en `lib/data.ts` más allá de su uso (no se agregan campos nuevos)
- Tests automatizados

## Modelo de datos

No se introducen estructuras de datos nuevas ni persistidas. La sección "Actividad en vivo" es una **derivación en memoria** a partir de lo ya existente en `lib/data.ts` (`GAMES`, `seededScores`), calculada en el propio `app/page.tsx`:

- **Top jugadores · hoy** (5 filas): para cada juego de `GAMES`, tomar la fila `rank === 1` de `seededScores(game.id.length * 17 + 3, 10)`; combinar las 8 filas resultantes, ordenar por `score` descendente y quedarse con las 5 primeras. Se re-numera el `rank` mostrado (1 a 5) según ese orden combinado.
- **Últimas puntuaciones** (7 filas): tomar, para 7 juegos distintos de `GAMES` (en su orden natural), la fila `rank === 2` de `seededScores(game.id.length * 17 + 3, 10)` como jugador/puntuación; emparejar con el `title` del juego y un tiempo relativo generado de forma determinista a partir del índice (ej. array fijo `["hace 2 min", "hace 5 min", "hace 8 min", "hace 12 min", "hace 18 min", "hace 24 min", "hace 31 min"]`, igual que el template).

No hay claves nuevas de `localStorage`.

## Plan de implementación

1. **Mover Biblioteca a `/biblioteca`** — Crear `app/biblioteca/page.tsx` con el contenido actual de `app/page.tsx` (sin cambios funcionales). Eliminar el `app/page.tsx` actual (se reemplaza en el paso 3).
2. **Actualizar enlaces internos** — En `app/juego/[id]/page.tsx`, `app/juego/[id]/jugar/page.tsx`, `app/salon/page.tsx` y `app/login/page.tsx`, cambiar toda referencia a `/` (como "volver a biblioteca" o redirect post-login) por `/biblioteca`.
3. **Actualizar `components/nav.tsx`** — Logo enlaza a `/`; agregar link "Inicio" activo en `/`; renombrar la lógica `isBiblioteca` para que aplique a `/biblioteca` y `/juego/*`; reflejar los mismos cambios en el panel móvil.
4. **Estilos del home** — Usar `/frontend-design` para definir clases nuevas en `app/globals.css` (hero, feature cards, mini-rail, stats, activity, pricing, final CTA, siluetas decorativas) reinterpretando `home.jsx`/`styles.css` del template con la paleta neón ya establecida en el proyecto.
5. **`app/page.tsx` (Home, Client Component)** — Construir las secciones del hero hasta el rail de juegos (hero, features, mini-rail con `GAMES.slice(0, 6)`), con hook `reveal` on-scroll vía `IntersectionObserver`.
6. **Stats + Actividad en vivo** — Agregar sección de stats (`GAMES.length` real + textos fijos) y la sección de actividad, calculando "Top jugadores · hoy" y "Últimas puntuaciones" con la lógica de derivación descrita en el modelo de datos, usando `useMemo`.
7. **Pricing + CTA final** — Agregar sección de pricing/FAQ (contenido estático) y la sección de CTA final, ambas con CTAs que navegan a `/biblioteca` y `/login` según corresponda.
8. **Verificación visual cruzada** — Recorrer `/` (nuevo home) y `/biblioteca` en desktop y mobile, comparando con `references/templates/home-about/home.jsx` y `Arcade Vault.html`; confirmar que todos los enlaces que antes apuntaban a `/` como biblioteca ahora resuelven correctamente, y que `/salon`, `/juego/[id]`, `/juego/[id]/jugar` y `/login` siguen funcionando sin regresiones.

## Criterios de aceptación

- [ ] `/` muestra la landing (hero, features, rail de juegos, stats, actividad en vivo, pricing, CTA final); `/biblioteca` muestra el grid de juegos con búsqueda y filtro por categoría (idéntico comportamiento a la Biblioteca de spec 01).
- [ ] El `Nav` (desktop y móvil) tiene links "Inicio" (→ `/`) y "Biblioteca" (→ `/biblioteca`) correctamente resaltados según la ruta activa; el logo enlaza a `/`.
- [ ] Los botones "Volver al vault" en `/juego/[id]`, `/juego/[id]/jugar` y `/salon` navegan a `/biblioteca`.
- [ ] Tras iniciar sesión, crear cuenta o entrar como invitado en `/login`, el usuario es redirigido a `/biblioteca`.
- [ ] La sección de stats del home muestra el número real de juegos (`GAMES.length`).
- [ ] "Top jugadores · hoy" muestra 5 filas derivadas de `seededScores` (no hardcodeadas), ordenadas por puntuación descendente.
- [ ] "Últimas puntuaciones" muestra 7 filas derivadas de `seededScores` con nombre de juego y tiempo relativo.
- [ ] Los CTAs del hero ("Explorar juegos" → `/biblioteca`, "Crear cuenta" → `/login`) y el CTA final ("Insertar moneda" → `/biblioteca`) navegan correctamente.
- [ ] Las animaciones `reveal` on-scroll funcionan en las secciones del home (aparecen al hacer scroll, no de entrada).
- [ ] El diseño visual fue definido con el skill `/frontend-design`, no copiado literal de `styles.css`, y es responsive en desktop y mobile.
- [ ] No quedan referencias rotas a `/` como biblioteca en el código (`app/`, `components/`).

## Decisiones tomadas y descartadas

- **Solo Home en este spec, "Acerca de" queda fuera:** aunque comparten carpeta de referencia (`home-about/`), son pantallas independientes; se decidió no mezclar objetivos. Se descartó incluir `about.jsx` en este spec.
- **Home pasa a ser `/`, Biblioteca se mueve a `/biblioteca`:** el template distingue "Inicio" de "Biblioteca" como rutas separadas en el nav; mantener `/` como biblioteca hubiera dejado sin ruta natural a la landing. Se descartó poner el home en una ruta secundaria (ej. `/inicio`) dejando `/` como biblioteca.
- **Actividad en vivo derivada de `seededScores`, no hardcodeada:** mantiene coherencia con los datos reales del proyecto (mismos juegos/leaderboards que `/salon` y `/juego/[id]`) en vez de inventar nombres/puntuaciones nuevas sin relación con `lib/data.ts`. Se descartó copiar los arrays fijos del prototipo tal cual.
- **Stats parcialmente reales:** solo `GAMES.length` se conecta a datos reales; "MILES DE PARTIDAS" y "GLOBAL RANKING" quedan decorativos porque no existe telemetría real de partidas jugadas ni ranking global agregable sin backend. Se descartó inventar cálculos ficticios adicionales para esas dos cifras.
- **Botones "volver" y redirect post-login apuntan a `/biblioteca`, no a `/` :** preservan su función original (volver al catálogo de juegos / continuar a jugar), no deben cambiar de comportamiento solo porque `/` cambió de contenido. Se descartó redirigir esos flujos a la nueva landing.
- **Pricing/FAQ como contenido estático:** consistente con la ausencia de backend/pagos reales del proyecto (mismo criterio que spec 01 con el plan único gratuito). Se descartó agregar lógica de planes.

## Riesgos identificados

- **Enlaces rotos por el cambio de ruta de Biblioteca:** cualquier referencia a `/` como biblioteca no actualizada en el paso 2 del plan quedaría apuntando a la landing por error. Mitigación: búsqueda exhaustiva de `href="/"` y `router.push("/")` en `app/` y `components/` antes de cerrar el spec (criterio de aceptación dedicado).
- **Costo de cálculo de "Actividad en vivo":** llamar `seededScores` 8 veces (una por juego) en cada render del home es barato (arrays pequeños, sin I/O) pero debe memoizarse con `useMemo` para evitar recalcular en cada re-render por scroll/estado del `reveal`.
