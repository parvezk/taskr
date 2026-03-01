# Taskr

A fast, multi-user todo app built with Next.js, Neon Postgres, and shadcn/ui. Users can manage personal todos with tags, mark tasks complete, and sign in with email or GitHub.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

---

## Features

- **Authentication** — Email/password and GitHub OAuth via Neon Auth
- **Todos** — Create, edit, delete, and mark tasks as done
- **Tags** — Create colour-coded tags and attach multiple tags to any todo
- **Filtering** — Filter by tag or completion status
- **Due dates** — Optional due dates with overdue highlighting
- **Per-user isolation** — Each user sees only their own data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + shadcn/ui + Tailwind CSS v4 |
| Auth | Neon Auth (`@neondatabase/auth`) |
| Database | Neon Postgres (serverless) |
| ORM | Drizzle ORM |
| Testing | Vitest (unit) + Playwright (E2E) |
| Linting | ESLint + Prettier |
| Deployment | Vercel |

---

## Prerequisites

- Node.js 20.9+
- A [Neon](https://neon.tech) project with:
  - A Postgres database
  - Neon Auth enabled
  - GitHub OAuth configured in Neon Auth

---

## Local Setup

### 1. Clone & install

```bash
git clone https://github.com/your-username/taskr.git
cd taskr
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string (from Neon dashboard) |
| `NEON_AUTH_BASE_URL` | Neon Auth base URL (from Neon Auth setup) |
| `NEXT_PUBLIC_APP_URL` | App URL, e.g. `http://localhost:3000` |

> **Note:** `DATABASE_URL` and `NEON_AUTH_BASE_URL` are provided by the Neon dashboard under your project's **Connection Details** and **Auth** sections respectively.

### 3. Run database migrations

```bash
npm run db:generate   # generate migration SQL
npm run db:migrate    # apply to your Neon database
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |
| `npm test` | Run Vitest unit tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Open Playwright UI |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:push` | Push schema directly (dev only) |

---

## Project Structure

```
app/
  (auth)/           # Sign-in and sign-up pages
  (dashboard)/      # Protected app pages (tasks, tags)
  api/auth/         # Neon Auth API handler
  layout.tsx        # Root layout with providers
  providers.tsx     # NeonAuthUIProvider
actions/
  todos.ts          # Todo server actions (CRUD)
  tags.ts           # Tag server actions (CRUD)
  auth.ts           # Auth server actions (sign in/up/out)
components/
  todos/            # Todo list, item, form, filters
  tags/             # Tag list, badge, form
  nav/              # Sidebar and user menu
  ui/               # shadcn/ui components
db/
  schema.ts         # Drizzle schema (todos, tags, todo_tags)
  index.ts          # Database client
lib/
  auth-client.ts    # Client-side auth
  auth-server.ts    # Server-side auth
tests/
  unit/             # Vitest unit tests
  e2e/              # Playwright E2E tests
```

---

## Database Schema

```
todos       — id, userId, title, description, done, dueDate, createdAt, updatedAt
tags        — id, userId, name, color, createdAt, updatedAt
todo_tags   — todoId, tagId  (M:N junction, cascades on delete)
```

User identity comes from Neon Auth sessions — no separate `users` table is needed.

---

## Neon Branching (for migrations)

Use Neon branching to test schema changes safely:

```bash
# Create a branch for your migration work (in Neon console or CLI)
neon branches create --name migration-test

# Point DATABASE_URL at the branch, then:
npm run db:generate
npm run db:migrate

# Verify, then merge or promote the branch
```

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js — no build config needed

### 3. Set environment variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add:

- `DATABASE_URL`
- `NEON_AUTH_BASE_URL`
- `NEXT_PUBLIC_APP_URL` (set to your Vercel domain, e.g. `https://taskr.vercel.app`)

### 4. Configure GitHub OAuth callback

In your GitHub OAuth App settings, add the callback URL:

```
https://your-neon-auth-project.auth.neon.tech/api/auth/callback/github
```

(The exact URL is shown in your Neon Auth dashboard.)

---

## Testing

### Unit tests (Vitest)

```bash
npm test
npm run test:coverage
```

Tests cover:
- Database schema shape
- Todo CRUD server actions (with mocked database)
- Tag CRUD server actions (with mocked database)
- Ownership enforcement (users can't access each other's data)

### E2E tests (Playwright)

```bash
# Requires a running dev server (or real credentials)
npm run test:e2e
```

Tests cover:
- Sign-in and sign-up page rendering and form validation
- Navigation between auth pages
- Redirect protection (requires real Neon Auth)
- Todo and tag CRUD flows (requires real credentials)

---

## License

Apache 2.0 — see [LICENSE](LICENSE).
