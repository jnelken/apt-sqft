# Repository Guidelines

## Project Structure & Module Organization

- Next.js App Router lives in `app/` (`page.tsx`, `layout.tsx`).
- Reusable UI components in `src/components/` (PascalCase; atoms in `src/components/ui/`).
- Domain logic in `src/lib/`:
  - `hooks/` (React hooks, e.g., `useFloorPlanManager.ts`).
  - `types/` (shared types, exported via `src/lib/types/index.ts`).
  - `utils/` (pure helpers).
- Assets in `public/`; global styles in `src/index.css` and `src/index.dev.css`.
- Tests are colocated as `*.test.ts(x)` next to sources.
- Internal docs/specs: `docs/`, `.kiro/`, and `PROJECT_SPEC.md`.

## Build, Test, and Development Commands

- `npm run dev`: Start Next.js dev server at `http://localhost:3000`.
- `npm run build`: Production build.
- `npm start`: Serve the production build.
- `npm test`: Run Jest + Testing Library.
- `npm run lint`: ESLint with `next/core-web-vitals` rules.

## Coding Style & Naming Conventions

- TypeScript strict mode is enabled (`tsconfig.json`).
- Use 2-space indentation, semicolons, and prefer named exports.
- Components: PascalCase (`FloorPlanTabs.tsx`). Hooks: `useXxx` (`useItemSelection.ts`).
- Constants: UPPER_SNAKE_CASE under `src/lib/constants/`.
- Hooks must satisfy `react-hooks/exhaustive-deps` (errors on missing deps).
- Path alias `@/*` → `src/*` (e.g., `import { x } from '@/lib/hooks/...'`).

## Testing Guidelines

- Framework: Jest (jsdom) + React Testing Library (`src/setupTests.ts`).
- Place tests alongside code (`useHistoryManager.test.ts`).
- Favor behavior-focused tests; mock only what you must.
- Coverage: run `npm test -- --coverage` locally for changes touching core hooks/components.

## Commit & Pull Request Guidelines

- Commits: imperative, concise subjects (e.g., "Fix resize logic", "Add furniture feature").
- Prefer small, focused commits; include scope when helpful.
- PRs include: clear description, before/after screenshots for UI, test plan/steps, linked issues, and rollback notes.
- CI should pass `lint` and `test` prior to review.

## Security & Configuration Tips

- Do not commit secrets; use `.env.local` for local config.
- App data persists in `localStorage`; avoid sensitive values.
- Keep large static assets in `public/` and reference via relative paths.
