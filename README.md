# todo-list-nest

Todo list API built with NestJS and PostgreSQL. It exposes endpoints to create todo items and list them by status. Default listing shows tasks that are `New` or `In Progress`, while creation accepts `New`, `In Progress`, or `Completed`.

## Prerequisites
- Docker Desktop (tested on macOS)
- Node.js 20+ and npm (optional, only if you plan to run locally without Docker)

## Quick Start (Docker)
1. Copy environment defaults: `cp .env.example .env` and adjust if necessary.
2. Build and launch services: `docker compose up --build`.
3. The API becomes available at `http://localhost:3000`.

The compose file also provisions a PostgreSQL instance exposed on port `5432` with the credentials found in `.env.example`.

## Local Development (without Docker)
```bash
npm install
npm run start:dev
```
Ensure you have a PostgreSQL server running and the environment variables defined in `.env`.

## API
- `GET /todos` — returns todo items filtered by `status` query params. Defaults to `status=New&status=In%20Progress` when none provided.
- `POST /todos` — creates a todo item. Body:
  ```json
  {
    "title": "string",
    "description": "optional string",
    "status": "New | In Progress | Completed" // optional, defaults to New
  }
  ```

## Web UI
- Visit `http://localhost:3000/` to access a lightweight interface for creating and browsing todos.
- The page lists todos in reverse chronological order, highlights their status, and refreshes after a successful submission.
- Use the **Refresh** button to manually pull the latest data when testing outside the form workflow.

## Scripts
- `npm run build` — compiles TypeScript into `dist/`.
- `npm run start:dev` — runs in watch mode using the Nest CLI.
- `npm run lint` — lints and auto-fixes common issues.
- `npm run test` — executes unit tests (write specs under `src/**/*.spec.ts`).
