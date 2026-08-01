# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Non-standard Next.js — read the docs before coding

`AGENTS.md` (imported above) warns that this project's `next` dependency (16.2.12) has
breaking changes vs. training data. Before writing or editing any Next.js code, check
`node_modules/next/dist/docs/` (sections: `01-app`, `02-pages`, `03-architecture`,
`04-community`) for the API actually in use here — do not assume upstream Next.js
conventions apply.

## Commands

```bash
npm run dev     # start dev server (next dev)
npm run build   # production build
npm run start   # run production build
npm run lint    # eslint
```

No test suite is configured.

## Project

Arcade Vault: a portal to play small arcade games online and compete on score
leaderboards. Built with Next.js App Router, React 19, TypeScript, and Tailwind CSS v4
(via `@tailwindcss/postcss`, configured through `app/globals.css`, no `tailwind.config`
file). Path alias `@/*` maps to the repo root (see `tsconfig.json`).

The app (`app/`) is currently the unmodified `create-next-app` scaffold — real
implementation hasn't started yet.

## Spec-driven workflow

Per `README.md`, this project follows spec-driven development using the `/spec` and
`/spec-impl` workflow from https://github.com/Klerith/fernando-skills, installed via:

```bash
npx skills@latest add Klerith/fernando-skills
```

Prefer writing a spec before implementing new features if these skills/commands are
available in the session.

## Design reference (`resources/templates/`)

This folder is a **static HTML/CDN-React prototype**, not part of the Next.js app —
it's a visual/UX reference for the real implementation, not code to import or build on
directly:

- `Arcade Vault.html` loads React 18 + Babel standalone from CDN and the `.jsx` files
  below as in-browser-transpiled scripts (no bundler, no npm).
- `data.jsx` — mock data: `GAMES` (id, title, category, cover, color, best score, plays),
  `CATS` (categories), `PLAYERS`, and a seeded-random leaderboard generator
  (`seededScores`).
- `nav.jsx`, `biblioteca.jsx` (library/catalog), `detalle.jsx` (game detail),
  `reproductor.jsx` (player), `auth.jsx`, `salon.jsx` (hall of fame) — one prototype
  screen/component each.
- `app.jsx` — root component; owns a hand-rolled hash-based router (`route` state
  synced to `location.hash`) and `localStorage`-backed user session (`av_user`) and
  score persistence (`av_scores`).
- `styles.css` — visual language: dark neon/retro-arcade theme (monospace fonts,
  scanline/noise overlays, per-game accent colors).

When porting this into the real app, the routes/screens map roughly to: library
(catalog + category filter), game detail, game player (with score submission), auth,
and hall of fame (leaderboard) — but re-implement with the App Router (file-based
routing, no hash router) rather than copying the prototype's routing/state approach.
