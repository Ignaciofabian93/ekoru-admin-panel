# Architecture & Code Style

This project is **feature-first** and mirrors the
[`ekoru-web-app`](../../ekoru-web-app) conventions. Routing lives in `app/`,
everything else lives in a feature. Use [`features/auth`](../features/auth) and
[`features/users`](../features/users) as the canonical reference — `users` is the
complete CRUD example, `auth` is the login flow.

Most rules below are enforced automatically by ESLint (`eslint.config.mjs`, via
`eslint-plugin-check-file`). Rules marked **convention** are followed by hand.

## 1. `app/[lang]` holds only routes

`app/**` may contain **only** Next.js route files: `page`, `layout`, `loading`,
`error`, `not-found`, `template`, `default`, `global-error`, `route`,
`middleware`, `sitemap`, `robots`, `manifest`, `opengraph-image`, `twitter-image`,
`icon`, `apple-icon`.

No components, hooks, helpers, or business logic. A page is a thin server
component that resolves `params` and renders a feature screen:

```tsx
// app/[lang]/(dashboard)/users/page.tsx
import { type SupportedLanguage } from "@/constants/settings";
import { UsersList } from "@/features/users/screens/UsersList";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <UsersList lang={lang} />;
}
```

_Enforced:_ any non-route filename under `app/**` is a lint error.

## 2. Route groups

- `app/[lang]/(auth)/` — unauthenticated screens (login). No dashboard chrome.
- `app/[lang]/(dashboard)/` — everything behind auth. Its `layout.tsx` renders
  the `DashboardShell` (sidebar + topbar) once for all child routes.

The `proxy.ts` middleware redirects `/` → `/[locale]` and blocks every route
except `/login` unless a session cookie is present.

## 3. Feature folder structure

```
features/<name>/
  screens/      # one screen component per page (server component, default)
  ui/           # presentational / client building blocks used by screens
  hooks/        # use* hooks (camelCase)
  constants/    # static config (only if needed)
  i18n/         # index.ts + locales/{en,es,fr}.json
  types.ts      # feature-local view-model types & helpers (optional)
```

`screens` and `i18n` are the backbone; the rest are added as needed.

## 4. Screens own the DictionaryProvider

Every screen wraps its content in a `DictionaryProvider` scoped to the feature's
own i18n namespace:

```tsx
// features/users/screens/UsersList.tsx
import { DictionaryProvider } from "@/i18n/context";
import { getUsersDictionary, NAMESPACE } from "../i18n";
import { UsersScreen } from "../ui/UsersScreen";

export async function UsersList({ lang }: { lang: SupportedLanguage }) {
  const dict = await getUsersDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <UsersScreen lang={lang} />
    </DictionaryProvider>
  );
}
```

Exception: the **dashboard** namespace is provided once in
`app/[lang]/(dashboard)/layout.tsx` because every dashboard screen shares it.
Global namespaces (`metadata`, `common`, `nav`) come from `app/[lang]/layout.tsx`.

The feature's `i18n/index.ts` exports `NAMESPACE`, a typed dictionary, and a lazy
`get<Feature>Dictionary(lang)` loader. Copy the shape from
[`features/users/i18n/index.ts`](../features/users/i18n/index.ts).

## 5. Access control is feature-aware

The admin panel has two account kinds (`adminType`). Gate UI with
`<PermissionGate>` and the `useAuthStore` selectors; never rely on the client
guard alone — the gateway must authorize every operation. See
[`ADMIN_ROLES.md`](ADMIN_ROLES.md).

```tsx
<PermissionGate
  adminType="PLATFORM"
  permission="MANAGE_USERS"
  fallback={<AccessDenied />}
>
  <UsersScreen lang={lang} />
</PermissionGate>
```

## 6. Naming conventions

| Path                                                | Rule                          | Example                              |
| --------------------------------------------------- | ----------------------------- | ------------------------------------ |
| `components/<Name>/` (folders)                      | **PascalCase**                | `components/DataTable/`              |
| `components/**/*.tsx`                               | **PascalCase**                | `components/DataTable/DataTable.tsx` |
| `features/**/ui/*.tsx`, `features/**/screens/*.tsx` | **PascalCase** (file only)    | `features/users/ui/UsersTable.tsx`   |
| `features/**/` (folders)                            | **lowercase / kebab-case**    | `features/my-business/`              |
| `**/hooks/*`                                        | **camelCase**, `use*`         | `features/users/hooks/useSellers.ts` |
| `app/**/` (folders)                                 | route-group / dynamic-segment | `(dashboard)`, `[lang]`, `[id]`      |

_Enforced:_ all rows above are lint errors when violated. i18n locale JSON and
`i18n/index.ts` keep their lowercase names.

## 7. Data layer

- **GraphQL** (`graphql/**`) → reads/writes through Apollo (`lib/apollo`). The
  browser talks to `/api/graphql`, which injects the HttpOnly `token` cookie and
  proxies to the gateway.
- **REST/session** (`lib/api`) → axios client for auth (`/api/auth/*`). Tokens
  live only in HttpOnly cookies; JS never holds them.
- Operation/field names in `graphql/admin` and `graphql/sellers` follow the
  expected admin schema — align them with the gateway if it differs.
