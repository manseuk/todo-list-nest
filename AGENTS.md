# Repository Guidelines

## Project Structure & Module Organization
This repository is a fresh NestJS todo API. Scaffold with `npx @nestjs/cli new todo-list-nest` or copy an existing Nest skeleton into the `src/` folder. Keep global providers in `src/app.module.ts` and feature code under `src/todos/` split into `controllers/`, `services/`, and `dto/`. Reserve `src/common/` for guards, interceptors, filters, and shared utilities. Create a `test/` workspace for end-to-end specs, while colocating unit specs beside implementation files as `*.spec.ts`.

## Build, Test, and Development Commands
Once `package.json` exists, run `npm install` to pull dependencies. Use `npm run start:dev` for local development with hot reload at `http://localhost:3000`. `npm run lint` should stay clean before committing; add a `lint` script pointing to ESLint + Prettier. Compile ahead of deployment with `npm run build`, which should emit to `dist/`. Validate business logic using `npm run test` for unit coverage and `npm run test:e2e` after wiring the e2e harness.

## Coding Style & Naming Conventions
Target TypeScript, two-space indentation, and strict compiler options (`"strict": true`). Use `PascalCase` for classes/providers (`TodosService`), `camelCase` for functions and variables, and `UPPER_SNAKE_CASE` for environment tokens. Name DTO files `*.dto.ts`, guards `*.guard.ts`, and pipes `*.pipe.ts`. Prefer lower-case directory names and avoid deep nesting—introduce submodules when logic grows beyond a single file.

## Testing Guidelines
Adopt Jest, already bundled with the Nest CLI template. Create `*.spec.ts` alongside services and controllers to capture unit behavior, and place full request flows under `test/*.e2e-spec.ts`. Mock external gateways with `TestingModule` and factories, not real HTTP calls. Shoot for 80%+ statement coverage; confirm via `npm run test -- --coverage`. New routes should land with both success and failure scenarios documented in tests.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat`, `fix`, `chore`, `test`, `refactor`) with short imperatives, e.g., `feat: create todo entity`. Keep PRs focused, include a summary of scope, list commands executed (`npm run test`, etc.), and link any planning tickets. Add screenshots or sample curl invocations when adjusting HTTP behavior.

## Getting Started Checklist
1. Scaffold the Nest app (`npx @nestjs/cli new todo-list-nest --package-manager npm`).
2. Copy `.env.example` from the template and fill local secrets—never commit real credentials.
3. Configure ESLint/Prettier scripts and enable `lint` + `format` in `package.json`.
4. Set up Git hooks (Husky or lint-staged) once tooling exists to keep commits clean.
