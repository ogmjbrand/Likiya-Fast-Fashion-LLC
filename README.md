# Likiya — Considered Luxury Fashion

A production-grade e-commerce platform for Likiya Fast Fashion, built as a
pnpm/Turborepo monorepo so the storefront, admin dashboard, and background
API can each be developed, deployed, and scaled independently while sharing
one design system, one auth/session layer, and one database.

## Status

This is a genuinely working Phase 1 build — not a mockup. Every page you can
click through queries real Supabase tables, checkout creates real orders and
redirects to real (test-mode) Stripe/Paystack/Flutterwave checkout sessions,
and the admin dashboard mutates the same rows the storefront reads. See
[`docs/ROADMAP.md`](docs/ROADMAP.md) for what's intentionally out of scope
for Phase 1 and what a team would build next.

## Monorepo layout

```
apps/
  storefront/   Customer-facing Next.js app (port 3000)
  admin/        Staff dashboard, RBAC-gated (port 3001)
  api/          Payment webhooks + cron jobs, no UI (port 3002)

packages/
  ui/           shadcn/ui components (Radix) + the shared Tailwind v4 design system
  auth/         Supabase auth operations, session helpers, RBAC middleware
  database/     Supabase client factories (browser/server/admin) + hand-authored types
  config/       Env validation (zod) + site config, shared across apps
  utils/        cn(), formatPrice/formatDate, rate limiting
  types/        Cross-app constants: RBAC permission keys, status label maps
  analytics/    GA4 + Microsoft Clarity loader and ecommerce event helpers
  hooks/        Small shared React hooks (media query, debounce, mounted)
  inventory/    Inventory adjustment + low-stock query helpers
  email/        Resend client + transactional email templates
  payments/     Stripe/Paystack/Flutterwave adapters + the shared order-fulfillment path

supabase/       Postgres schema (numbered migrations), seed data, local config
docs/           Architecture, database, deployment, and environment reference
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for why it's split this way.

## Quick start

Prerequisites: Node 20+, [pnpm](https://pnpm.io) 9+, a Supabase project (or the
[Supabase CLI](https://supabase.com/docs/guides/cli) for local Postgres).

```bash
pnpm install

# Apply the schema to your Supabase project
supabase link --project-ref <your-project-ref>
supabase db push

# Or run Postgres locally
supabase start && supabase db reset   # applies migrations + supabase/seed/seed.sql

# Copy env files and fill in real values (see docs/ENVIRONMENT.md)
cp apps/storefront/.env.example apps/storefront/.env.local
cp apps/admin/.env.example apps/admin/.env.local
cp apps/api/.env.example apps/api/.env.local

pnpm dev              # runs storefront (:3000), admin (:3001), api (:3002) together
pnpm dev:storefront   # or just one app
```

The first user who signs up won't be staff — promote them from the SQL
editor: `update profiles set role = 'admin' where id = '<user-id>';`

## Common scripts

Run from the repo root (Turborepo fans these out to every workspace that has
the script defined):

| Script            | What it does                                    |
| ------------------ | ------------------------------------------------ |
| `pnpm dev`          | All three apps in parallel, with hot reload       |
| `pnpm build`        | Production build of every app                    |
| `pnpm lint`         | ESLint across every app                           |
| `pnpm typecheck`    | `tsc --noEmit` across every app and package        |
| `pnpm test`         | Vitest unit tests (packages/utils, apps/storefront) |
| `pnpm test:e2e`     | Playwright end-to-end tests (apps/storefront)      |
| `pnpm format`       | Prettier, with the Tailwind class-sorting plugin   |
| `pnpm db:types`     | Regenerate `packages/database/src/generated-types.ts` from a linked Supabase project |

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, package boundaries, why the monorepo is shaped this way
- [`docs/DATABASE.md`](docs/DATABASE.md) — schema, RLS model, key business-logic functions
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — deploying all three apps to Vercel + Supabase
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) — every environment variable, per app
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — what's built, what's deliberately simplified, what's next
