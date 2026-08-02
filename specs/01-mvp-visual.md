# Spec 01 — MVP Visual de Arcade Vault

- **Estado:** Aprobado
- **Dependencias:** Ninguna (primer spec del proyecto)
- **Fecha:** 2026-08-02

**Objetivo:** Implementar visualmente las 5 pantallas de Arcade Vault (biblioteca, detalle de juego, reproductor mock, autenticación y salón de la fama) en Next.js App Router con Tailwind v4 y el skill `/frontend-design`, replicando el lenguaje visual neón-retro de `references/templates/`, con datos mock tipados en `lib/data.ts` y persistencia de sesión/puntuaciones en `localStorage`, sin implementar ningún juego real.

## Scope

**Dentro del alcance:**

- 5 rutas/pantallas en App Router:
  - `/` — Biblioteca (grid de juegos, búsqueda por nombre, filtro por categoría)
  - `/juego/[id]` — Detalle de juego (info, tags, stats, leaderboard del juego, CTA jugar)
  - `/juego/[id]/jugar` — Reproductor mock (HUD con puntuación/vidas/nivel simulados por timer, arena CRT decorativa, pausa, modal de fin de partida con guardado de puntuación)
  - `/login` — Autenticación (tabs iniciar sesión / crear cuenta, modo invitado, botones sociales decorativos)
  - `/salon` — Salón de la Fama (tabs por juego, podio top 3, tabla de posiciones, fila "tu mejor marca" si hay sesión)
- `Nav` (desktop + menú hamburguesa móvil) con logo, links activos, contador de créditos decorativo, botón de sesión/avatar
- Footer global
- `lib/data.ts`: `GAMES`, `CATS`, `PLAYERS`, `seededScores()` tipados en TypeScript
- Covers de juego como gradientes/patrones CSS por `color`/`cover` id (sin assets de imagen)
- Sesión falsa y puntuaciones en `localStorage` (`av_user`, `av_scores`), sin backend
- Diseño responsive (desktop/mobile) siguiendo el skill `/frontend-design`, reinterpretando el tema neón-retro del prototipo (no copiar `styles.css` literal)
- Split Server/Client Components: Nav, Biblioteca, Auth, Reproductor y Salón son Client; Detalle de juego es Server

**Fuera del alcance (queda para specs futuros):**

- Implementación real de cualquier juego (canvas, lógica de gameplay, colisiones)
- Backend/API routes, base de datos, autenticación real (OAuth, contraseñas, JWT/sesiones)
- Leaderboard compartido entre usuarios/dispositivos (las puntuaciones son solo `localStorage` local al navegador)
- Sistema de créditos con lógica real (consumo, compra, límites)
- Tests automatizados
- Sonido/audio

## Modelo de datos

Todo vive en `lib/data.ts` (mock, tipado) salvo lo que se persiste en `localStorage` (definido en los componentes que lo usan).

### `lib/data.ts`

```typescript
export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string;   // id usado para mapear a un gradiente/patrón CSS
  color: "cyan" | "magenta" | "green" | "yellow";
  best: number;
  plays: string;   // ya formateado, ej. "12.4K"
}

export const GAMES: Game[];
export const CATS: readonly ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];
export const PLAYERS: string[];

export interface LeaderboardRow {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/AAAA"
}

export function seededScores(seed: number, count?: number): LeaderboardRow[];
```

### Persistencia en `localStorage`

```typescript
// clave: "av_user"
interface StoredUser {
  name: string; // iniciales/nombre en mayúsculas, máx 10 chars
}

// clave: "av_scores"
interface StoredScoreEntry {
  game: string;   // Game.id
  score: number;
  name: string;
  at: number;     // Date.now()
}
type StoredScores = StoredScoreEntry[];
```

No se introduce ningún otro almacén de datos (sin base de datos, sin API routes) en este spec.

## Plan de implementación

1. **Datos mock** — Crear `lib/data.ts` portando `GAMES`, `CATS`, `PLAYERS` y `seededScores()` desde `references/templates/data.jsx`, tipado según el modelo de datos acordado.

2. **Sistema de sesión compartido** — Crear un `SessionProvider` (Client Component, Context) que lee `av_user` de `localStorage` al montar y expone `user`, `login(name)`, `logout()`. Se monta en `app/layout.tsx` envolviendo toda la app, para que `Nav` y las páginas que lo necesiten (Reproductor, Salón, Auth) compartan la misma sesión sin prop-drilling entre rutas.

3. **Fundamentos visuales** — Usar el skill `/frontend-design` para definir la dirección visual (paleta neón, tipografías mono/pixel, tokens de color por categoría/juego) y aplicarla en `app/globals.css` (Tailwind v4 vía `@theme`/CSS vars), reemplazando el scaffold por defecto de `create-next-app`.

4. **Layout + Nav + Footer** — Construir `components/Nav.tsx` (Client, usa `SessionProvider`, incluye menú hamburguesa móvil y contador de créditos decorativo) y el footer, integrados en `app/layout.tsx`. El sitio ya navega entre rutas (aunque las páginas aún no existan) con header/footer consistentes.

5. **Biblioteca (`/`)** — `app/page.tsx` (Client): grid de `GameCard`, barra de búsqueda, chips de categoría, estado vacío "NO HAY RESULTADOS". Covers como gradiente CSS por `game.color`/`game.cover`.

6. **Detalle de juego (`/juego/[id]`)** — `app/juego/[id]/page.tsx` (Server Component): info del juego, tags, stats, leaderboard vía `seededScores`, CTAs "Jugar ahora" / "Volver al vault". `notFound()` si el `id` no existe en `GAMES`.

7. **Autenticación (`/login`)** — `app/login/page.tsx` (Client): tabs iniciar sesión/crear cuenta, modo invitado, botones sociales decorativos (sin acción real), usa `SessionProvider.login()` y redirige a `/` tras entrar.

8. **Reproductor mock (`/juego/[id]/jugar`)** — `app/juego/[id]/jugar/page.tsx` (Client): HUD (jugador, puntuación, vidas, nivel), arena CRT decorativa, pausa/fin de partida, modal de guardado de puntuación que escribe en `av_scores` vía `localStorage`. `notFound()` si el `id` no existe.

9. **Salón de la fama (`/salon`)** — `app/salon/page.tsx` (Client): tabs por juego, podio top 3, tabla completa, fila "tu mejor marca" si hay sesión activa (usa `SessionProvider`).

10. **Verificación visual cruzada** — Recorrer las 5 rutas en desktop y mobile comparando con `references/templates/Arcade Vault.html`, confirmando navegación, estados vacíos/hover, persistencia de sesión y puntuaciones tras recargar la página.

## Criterios de aceptación

- [ ] `lib/data.ts` exporta `GAMES`, `CATS`, `PLAYERS` y `seededScores()` tipados, con los mismos 8 juegos y valores que `references/templates/data.jsx`.
- [ ] Existe un `SessionProvider` compartido; iniciar sesión en `/login` actualiza el estado de `Nav` sin recargar la página, y persiste tras un refresh (lee `av_user` de `localStorage`).
- [ ] `/` muestra el grid de 8 juegos, filtra por categoría (`TODOS`, `ARCADE`, `PUZZLE`, `SHOOTER`, `VERSUS`) y por texto de búsqueda; muestra el estado "NO HAY RESULTADOS" cuando el filtro no matchea nada.
- [ ] `/juego/[id]` muestra la info del juego correcto y un leaderboard de 10 filas generado por `seededScores`; con un `id` inexistente responde 404.
- [ ] Desde `/juego/[id]` el botón "Jugar ahora" navega a `/juego/[id]/jugar`.
- [ ] `/juego/[id]/jugar` incrementa la puntuación automáticamente cada ~220ms mientras no está en pausa ni terminado; "Pausa" detiene el incremento; "Fin" abre el modal de fin de partida.
- [ ] Guardar la puntuación en el modal de fin de partida agrega una entrada a `av_scores` en `localStorage` (verificable inspeccionando `localStorage` tras la acción).
- [ ] `/login` permite iniciar sesión con nombre, crear cuenta (tab distinto) o entrar como invitado; cualquiera de las tres rutas deja al usuario en `/` con sesión activa (excepto invitado, que no persiste `av_user`).
- [ ] `/salon` muestra tabs para los 8 juegos; cambiar de tab recalcula podio y tabla; si hay sesión activa se muestra la fila "tu mejor marca".
- [ ] El `Nav` (desktop y menú hamburguesa mobile) permite navegar a las 5 rutas y refleja correctamente el estado de sesión (botón "Iniciar sesión" vs nombre de usuario).
- [ ] El diseño visual (colores, tipografías, layout) fue definido con el skill `/frontend-design`, no copiado literal de `styles.css`, y es responsive en desktop y mobile.
- [ ] No existe ningún archivo de gameplay real (canvas, loop de física, colisiones) — el reproductor es exclusivamente un mock visual.

## Decisiones tomadas y descartadas

- **Reproductor incluido como mock visual** (no excluido del MVP): se decidió portar el HUD/puntuación simulada/modal de fin de partida tal cual, ya que el spec pide "todas las pantallas" y sirve de placeholder hasta que exista un juego real. Se descartó excluirlo del MVP.
- **Rutas en español** (`/juego/[id]`, `/salon`, `/login`) en lugar de inglés (`/game/[id]`, `/hall-of-fame`): consistencia con el idioma de la UI. Se descartó usar rutas en inglés.
- **Persistencia con `localStorage`** (fake auth + scores), igual que el prototipo: mantiene el MVP sin backend. Se descartó dejar el login/guardado de puntuación como puramente visual sin persistencia real en el navegador.
- **Diseño reinterpretado con `/frontend-design`** en vez de portar `styles.css` literal: decisión revertida durante la sesión — inicialmente se eligió portar el CSS tal cual por velocidad, pero se corrigió para respetar la instrucción del `CLAUDE.md` del proyecto ("usa siempre `/frontend-design` para diseñar la interfaz"). Se descartó copiar `styles.css` literal.
- **Covers como gradientes CSS**, no imágenes: cero assets nuevos que gestionar, igual que el prototipo (clases `cover-*` mapeadas a `color`). Se descartó generar/conseguir imágenes de portada.
- **`lib/data.ts` en TypeScript tipado**, no JSON estático: permite compartir tipos (`Game`, `LeaderboardRow`) entre Server y Client Components sin fetch adicional. Se descartó un `.json` sin tipos.
- **Split Server/Client Components** siguiendo buenas prácticas de App Router (Detalle de juego es Server; Biblioteca, Auth, Reproductor, Salón y Nav son Client por su estado/interactividad). Se descartó hacer todo Client Component como en el prototipo original.
- **`SessionProvider` centralizado** (Context) en `app/layout.tsx`, decisión no explícitamente preguntada pero necesaria: el prototipo tenía un único componente `App` con estado de sesión compartido entre "pantallas"; en App Router cada ruta se renderiza por separado, así que se requiere un context provider para que `Nav`, Auth, Reproductor y Salón compartan la misma sesión sin prop-drilling entre rutas.
- **Contador de créditos y botones sociales (Google/GitHub) decorativos**, sin lógica real: consistente con que no hay backend/auth real en este MVP. Se descartó eliminarlos de la UI.

## Riesgos identificados

- **Hydration mismatch por `localStorage`:** leer `av_user`/`av_scores` durante el render inicial puede diferir entre servidor y cliente. Mitigación: `SessionProvider` debe inicializar el estado en `null`/vacío y sincronizar con `localStorage` dentro de un `useEffect` tras montar, aceptando un flash inicial de "sin sesión".
- **IDs de ruta dinámica inválidos:** navegar a `/juego/id-inexistente` o `/juego/id-inexistente/jugar` debe resolver en 404 (`notFound()`), no en un crash por `game` `undefined`.
- **Multi-tab / storage events:** si el usuario tiene dos pestañas abiertas, los cambios de sesión o puntuación en una no se reflejan automáticamente en la otra (no se implementa un listener de `storage`). Se acepta como limitación conocida del MVP, no se corrige en este spec.
