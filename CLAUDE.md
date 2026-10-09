# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`apt-sqft` is a client-side floor plan editor. Users enter room dimensions and furniture, and the app renders a draggable, grid-snapped 2D top-down layout used to approximate apartment listings and reason about price-per-square-foot. All data lives in the browser (localStorage + sessionStorage); there is no backend.

The authoritative product/design intent lives in `.cursor/rules/project-instructions.mdc` (data model rules, relative-vs-absolute rooms, grid snapping, "em = 1 inch" convention). Read it before changing editor/geometry behavior. Note that `PROJECT_SPEC.md` is partly stale (it describes a Create React App setup and an older data model) — trust the code and the cursor rules over it.

## Commands

- `npm run dev` — Next.js dev server at http://localhost:3000
- `npm run build` — production build (also the way to run a full typecheck via Next)
- `npm run typecheck` — `tsc --noEmit` only
- `npm run lint` — ESLint (`next/core-web-vitals`)
- `npm test` — Jest + React Testing Library (jsdom)
- `npm test -- path/to/file.test.ts` — run a single test file
- `npm test -- -t "name"` — run tests matching a name
- `npm test -- --coverage` — coverage (thresholds enforced in `jest.config.js`: 65% statements/lines, 50% functions, 35% branches)
- `npm run format` — Prettier write

Git hooks (`.githooks/`): pre-commit runs lint-staged + lint + typecheck; pre-push runs the full test suite. CI mirrors lint + test.

## Architecture

**Next.js shell wrapping a client-only SPA.** This is the most important structural fact:

- `app/page.tsx` is the only real page. It `dynamic()`-imports `src/App.tsx` with `ssr: false`. The entire application is therefore a client-rendered SPA — there is no server-side rendering, no API routes, and no data fetching. Treat `src/App.tsx` as the true app root.
- `src/index.tsx` and `src/reportWebVitals.ts` are leftover Create React App scaffolding and are **not** used by the Next.js entry. Don't wire new code through them.

**State lives in `useAppController`, behavior lives in hooks, `App.tsx` is layout.** `src/lib/hooks/useAppController.ts` owns the top-level `useState` (`floorPlans`, `currentFloorPlanName`, `appState`, plus sidebar/panel UI state) and composes the manager hooks in `src/lib/hooks/`; `src/App.tsx` calls it and renders the layout. Each hook encapsulates one slice of behavior:

- `useLocalStoragePersistence` — load/save the whole app blob; `initializeStateFromStorage()` seeds initial state
- `useHistoryManager` — undo/redo, stored in sessionStorage
- `useFloorPlanManager`, `useRoomManager`, `useFurnitureManager` — CRUD on the respective entities
- `useItemSelection`, `useKeyboardShortcuts`, `useAppSettings` — selection, hotkeys, and settings (theme, grid, colors)

When adding editor behavior, prefer adding/extending a hook over growing `App.tsx` or `useAppController`.

**Data model** (`src/lib/types/index.ts`): A `FloorPlan` has `rooms`, `furnitureInstances`, a background image, and `imageScale`. Furniture uses an **inventory + instances** split: `FurnitureInventory` maps an id → a `Furniture` definition, and each `FurnitureInstance` references that id plus its own `x/y/rotation`. `App.tsx` joins instances against the inventory (once per render, via `getFurnitureFromInstances` in `src/lib/utils/`) to produce concrete `Furniture[]` for rendering. (This supersedes the older "furniture extends room" model in `PROJECT_SPEC.md`.) Both `Room` and `Furniture` are point-based: a room is a set of `Point`s, and walls are derived by a shortest-path rule rather than stored explicitly.

**Rendering & units:** `LayoutEditor.tsx` is the canvas. Geometry uses the convention that **1rem/1em ≈ 1 inch**, which makes relative room sizing and furniture scaling straightforward in CSS. Points snap to the grid only when edited, not when the grid size changes.

## Conventions

- TypeScript strict mode; path alias `@/*` → `src/*`.
- Components in `src/components/` (PascalCase); shared atoms in `src/components/ui/`. Domain logic in `src/lib/` (`hooks/`, `types/`, `utils/`, `constants/`).
- Prefer named exports. Tests are colocated as `*.test.ts(x)`.
- `react-hooks/exhaustive-deps` is enforced as an error — keep hook dependency arrays complete.
- The repo follows the React/TypeScript guidelines in the parent `../CLAUDE.md` (component extraction, shared base components like `BaseForm`/`ItemForm`, centralized defaults, no HTML form state).
