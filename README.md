# Ekoru Admin Panel

Internal administration console for the Ekoru platform. It mirrors the
[`ekoru-web-app`](../ekoru-web-app) architecture (feature-first layout,
`app/[lang]` routing, multilanguage support, same lint/format rules) but serves
**administrators** rather than end customers.

## Who uses it

There are two kinds of admin accounts, distinguished by `adminType`:

| `adminType` | Who                       | Scope                                                                 |
| ----------- | ------------------------- | --------------------------------------------------------------------- |
| `PLATFORM`  | Ekoru staff accounts      | Full CRUD over the database — users, content, taxonomy, etc.          |
| `BUSINESS`  | Business owner / managers | Their **own business data only** (products, orders, business profile) |

Access is gated by `adminType`, `AdminRole`, and `AdminPermission`. See
[`docs/ADMIN_ROLES.md`](docs/ADMIN_ROLES.md).

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to the
default locale (`/es`) and, if unauthenticated, to `/[lang]/login`.

## Conventions

- **Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — feature-first,
  enforced by ESLint (`eslint-plugin-check-file`).
- **Lint:** `pnpm lint` / `pnpm lint:fix`
- **Format:** `pnpm format` / `pnpm format:check`
- Pre-commit runs `lint-staged` (eslint + prettier on staged files) via Husky.

## Environments

`NEXT_PUBLIC_ENVIRONMENT` (`development` | `staging` | `production`) selects the
gateway in [`config/endpoints.ts`](config/endpoints.ts).
