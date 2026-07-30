# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project. Application routes, layouts, and API handlers live in `src/app`, with API routes under `src/app/api`. Reusable UI is in `src/components`, grouped by feature (`home`, `order`, `invoice`, `panel`, `ui`). Shared utilities and database code are in `src/lib`, including Drizzle schema and connection files in `src/lib/db`. React hooks are in `src/hooks`, providers/context in `src/context`, shared types in `src/types`, static assets in `public`, and registry tooling in `registry` plus `scripts`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Next.js development server.
- `npm run build`: create a production build and run Next.js type/lint checks.
- `npm run start`: serve the production build.
- `npm run lint`: run ESLint over the repository using `eslint.config.mjs`.
- `npm run registry:build`: rebuild registry artifacts with `tsx ./scripts/build-registry.ts`.
- `npm run cb`: clear Next/cache output, build, then restart PM2 processes; use only in the intended deployment environment.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Prefer kebab-case filenames for route and component files already using that style, and PascalCase for exported component names. Keep feature-specific logic near its route or component; move shared helpers to `src/lib` and shared hooks to `src/hooks`. Styling is Tailwind CSS with local component primitives in `src/components/ui`; reuse existing utility helpers such as `cn` from `src/lib/utils` instead of duplicating class merge logic.

## Testing Guidelines

No dedicated test runner is currently configured. Before submitting changes, run `npm run lint` and `npm run build`. For API or database changes, add focused manual verification notes and validate affected routes locally. If tests are introduced, place them near the feature or in a clearly named test folder, using `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style messages, for example `feat: ...` and `refactor(ui): ...`. Keep commits scoped and descriptive. Pull requests should include a short summary, verification commands, linked issue or task context when available, and screenshots for UI changes. Do not include generated build output such as `.next`.

## Security & Configuration Tips

Do not commit secrets or local environment files. Keep database access through `src/lib/db` and validate external input in API routes with existing schema or validation utilities. Run `npm audit --audit-level=high` after dependency updates.
