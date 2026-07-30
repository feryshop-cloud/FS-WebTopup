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

## Bash → PowerShell Command Map

This repo runs on Windows with PowerShell 5.1. The `bash` tool here executes PowerShell, **not** GNU bash. The following common bash commands do **not** work and have PowerShell equivalents:

| Bash | PowerShell | Notes |
|---|---|---|
| `grep` | `Select-String` or `findstr` | `findstr` is simpler for basic patterns |
| `cat` | `Get-Content` or `type` | `type` is the closest equivalent |
| `ls` | `Get-ChildItem` or `dir` | `dir` works in both cmd and PowerShell |
| `tail` | `Select-Object -Last` | No `tail` in PowerShell; use `Get-Content \| Select-Object -Last N` |
| `head` | `Select-Object -First` | No `head` in PowerShell |
| `rm` | `Remove-Item` or `del` | `del` for files, `Remove-Item` for dirs |
| `rm -rf` | `Remove-Item -Recurse -Force` | No `-rf` flag in PowerShell |
| `cp` | `Copy-Item` or `copy` | `copy` works in both cmd and PowerShell |
| `mv` | `Move-Item` or `move` | `move` works in both cmd and PowerShell |
| `mkdir` | `New-Item -ItemType Directory` or `mkdir` | `mkdir` works in PowerShell |
| `du` | `(Get-ChildItem -Recurse \| Measure-Object Length -Sum).Sum` | No `du` in PowerShell |
| `find` | `Get-ChildItem -Recurse` | PowerShell's `Get-ChildItem -Recurse` |
| `sed` | `ForEach-Object -Replace` | No `sed` in PowerShell |
| `awk` | `ForEach-Object` + parsing | No `awk` in PowerShell |
| `wc -l` | `(Get-Content file).Count` | Count lines in a file |
| `&&` chaining | `;` or `if ($?)` | PowerShell doesn't support `&&`; use `;` or conditional blocks |
| `2>/dev/null` | `2>&1 \| Out-Null` | No `/dev/null` in PowerShell |
| `| head -N` | `\| Select-Object -First N` | Pipeline syntax differs |
| `| tail -N` | `\| Select-Object -Last N` | Pipeline syntax differs |

**Key gotcha:** `&&` is not a valid statement separator in PowerShell 5.1. Use `;` to chain commands or `if ($?) { ... }` for conditional chaining. The `bash` tool wraps commands in PowerShell, so `cmd1 && cmd2` will fail — use `cmd1; if ($?) { cmd2 }` instead.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Prefer kebab-case filenames for route and component files already using that style, and PascalCase for exported component names. Keep feature-specific logic near its route or component; move shared helpers to `src/lib` and shared hooks to `src/hooks`. Styling is Tailwind CSS with local component primitives in `src/components/ui`; reuse existing utility helpers such as `cn` from `src/lib/utils` instead of duplicating class merge logic.

## Testing Guidelines

No dedicated test runner is currently configured. Before submitting changes, run `npm run lint` and `npm run build`. For API or database changes, add focused manual verification notes and validate affected routes locally. If tests are introduced, place them near the feature or in a clearly named test folder, using `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style messages, for example `feat: ...` and `refactor(ui): ...`. Keep commits scoped and descriptive. Pull requests should include a short summary, verification commands, linked issue or task context when available, and screenshots for UI changes. Do not include generated build output such as `.next`.

## Security & Configuration Tips

Do not commit secrets or local environment files. Keep database access through `src/lib/db` and validate external input in API routes with existing schema or validation utilities. Run `npm audit --audit-level=high` after dependency updates.

## Key Architecture Notes

- **`forcedTheme` in ThemeProvider was removed** — it was forcing the theme to always be dark, breaking the `ModeToggle` component. The `ThemeProvider` now uses `defaultTheme="dark"` with `enableSystem` and no `forcedTheme`.
- **`next/dynamic` with `ssr: false`** is the pattern for client-only components used in server layouts (e.g., `ProgressBarWrapper`). Do not use `ssr: false` with `next/dynamic` inside a Server Component — create a Client Component wrapper instead.
- **`theme.allow_toggle`** in `src/lib/data/settings.ts` controls whether the theme toggle is enabled. Set to `true` to allow users to switch themes.
- **`framer-motion`** is a heavy dependency used by `ProgressBar`. Keep it in a dynamically imported client component to avoid bloating the layout chunk.
- **`eslint.config.mjs`** uses Flat Config format (ESLint 9+). The `cb` script in `package.json` uses `rm -rf` which is a Unix command and will fail on Windows PowerShell.
