# Project Specification

A client-side floor plan editor. Users enter room dimensions and furniture, and the app renders a draggable, grid-snapped 2D top-down layout used to approximate apartment listings and reason about price-per-square-foot. All data lives in the browser — there is no backend.

> The authoritative product/design intent lives in `.cursor/rules/project-instructions.mdc` (relative-vs-absolute rooms, grid snapping, the "em = 1 inch" convention, drag/point rules). This file describes the technical architecture as built. Where they overlap, the cursor rules govern design behavior and the code governs current data shapes.

## Technology Stack

- **Next.js 15** (App Router) — see "Application shell" below
- **React 19**
- **TypeScript 5.9** (strict mode)
- **Material-UI v7** + **Emotion** (CSS-in-JS)
- `react-colorful` — color picker
- **Jest** + **React Testing Library** (jsdom) — testing
- **ESLint** (`next/core-web-vitals`) + **Prettier**

## Project Structure

```
app/                     # Next.js App Router entry (shell only)
  layout.tsx             # Root layout + metadata
  page.tsx               # dynamic()-imports src/App.tsx with ssr: false
src/
  App.tsx                # True application root: top-level state + hook composition
  components/            # UI components (PascalCase)
    ui/                  # Shared atoms (ActionButtons, CompactTextField, DimensionSelector)
    LayoutEditor.tsx     # The 2D canvas
    BaseForm.tsx, ItemForm.tsx, RoomForm.tsx, FurnitureForm.tsx, ...
  lib/
    hooks/               # One manager hook per behavior slice (see State Management)
    types/index.ts       # Shared TypeScript interfaces
    utils/               # Pure helpers (e.g. formatInitialDimensions.ts)
    constants/           # e.g. furniture.constants.ts
  index.tsx, reportWebVitals.ts   # Legacy CRA scaffolding — NOT used by Next.js
```

Path alias: `@/*` → `src/*`.

## Application Shell

The entire app is a **client-only SPA mounted inside Next.js**. `app/page.tsx` is the only real page; it `dynamic()`-imports `src/App.tsx` with `ssr: false`. Consequences:

- No server-side rendering, no API routes, no server data fetching.
- `src/App.tsx` is the true app root — treat it as such.
- `src/index.tsx` / `reportWebVitals.ts` are leftover Create React App files and are not part of the Next.js entry path.

## State Management

`src/App.tsx` owns the top-level `useState` (`floorPlans`, `currentFloorPlanName`, `appState`) and composes manager hooks from `src/lib/hooks/`. Each hook encapsulates one slice of behavior:

- **`useLocalStoragePersistence`** — load/save the whole app blob; `initializeStateFromStorage()` seeds initial state
- **`useHistoryManager`** — undo/redo, stored in sessionStorage
- **`useFloorPlanManager`** / **`useRoomManager`** / **`useFurnitureManager`** — CRUD on each entity
- **`useItemSelection`** — current selection
- **`useKeyboardShortcuts`** — hotkeys
- **`useAppSettings`** — theme, grid, colors

When adding editor behavior, extend or add a hook rather than growing `App.tsx`.

### Persistence

- **localStorage** — floor plans and app settings, saved as a single JSON blob. A download/upload flow lets users export/import that blob.
- **sessionStorage** — undo/redo history (kept out of localStorage to avoid bloat).

## Core Data Models

Defined in `src/lib/types/index.ts`.

```typescript
interface Point {
  x: number;
  y: number;
}

interface Wall {
  start: Point;
  end: Point;
}

interface Room {
  id: string;
  name: string;
  height: number;
  width: number;
  sqFootage: number;
  livability: 'livable' | 'non-livable' | 'outdoor';
  points: Point[];
  x: number;
  y: number;
}

interface Furniture extends Room {
  type: string;
  color?: string; // hex
}

interface FloorPlan {
  name: string;
  rooms: Room[];
  furnitureInstances: FurnitureInstance[];
  backgroundImage: string | null;
  imageScale: number;
}
```

### Furniture: inventory + instances

Furniture uses an **inventory/instances split** rather than storing full furniture objects on the floor plan:

```typescript
interface FurnitureInventory {
  [furnitureId: string]: Furniture;
}

interface FurnitureInstance {
  furnitureId: string; // reference into the inventory
  x: number;
  y: number;
  rotation?: number;
}
```

`App.tsx` joins each `FurnitureInstance` against `FurnitureInventory` to produce concrete `Furniture[]` for rendering. `FurnitureTemplate` (in the same file) defines catalog defaults (size, color, category) used when creating new inventory entries.

### Geometry rules

- A room/furniture is a **set of points**; walls are derived by a shortest-path rule, not stored explicitly. (Every point connects to two walls; every wall to two points.)
- The unit convention is **1rem/1em ≈ 1 inch**, which makes relative room sizing and furniture scaling straightforward in CSS.
- Points snap to the grid only when edited — changing the grid size does not move existing points.
- `height`/`width` seed the initial sqFootage and first 4 points only. See the cursor rules for the full absolute/relative-room and drag/short-wall behavior.

## Build & Development

```bash
npm run dev          # Next.js dev server (http://localhost:3000)
npm run build        # Production build (also a full typecheck)
npm start            # Serve the production build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm test             # Jest + RTL
npm test -- --coverage   # Coverage (thresholds in jest.config.js)
```

Git hooks (`.githooks/`): pre-commit runs lint-staged + lint + typecheck; pre-push runs the full test suite.

## Conventions

- TypeScript strict mode; prefer named exports; 2-space indentation.
- Components: PascalCase. Hooks: `useXxx`. Constants: UPPER_SNAKE_CASE under `src/lib/constants/`.
- `react-hooks/exhaustive-deps` is enforced as an error.
- Tests colocated as `*.test.ts(x)`; favor behavior-focused tests.
- Follow the React/TypeScript guidelines in the parent `../CLAUDE.md` (shared base components, centralized defaults, controlled inputs over HTML form state).

## Testing Strategy

- **Unit** — pure utilities and individual hooks/components in isolation.
- **Integration** — state flows and user workflows (add room, move furniture, undo/redo).
- Tools: Jest (jsdom), React Testing Library, `@testing-library/user-event`.

## Security & Data Handling

- All data is stored and processed locally; no server communication.
- Image uploads are handled client-side only via the File API.
- Don't persist sensitive values in localStorage; use `.env.local` for any local config.

## Future Enhancements (not scheduled)

- Export to PDF/PNG; total-sqft constraint logic (NYC listing rules); hotkeys toolbar; rotation in 15° intervals; 3D visualization. See `.cursor/rules/project-instructions.mdc` for design notes on these.
