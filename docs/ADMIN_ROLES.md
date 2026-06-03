# Admin Roles & Access Control

The admin panel serves two distinct audiences, switched on a single field:
`admin.adminType`.

| `adminType` | Who they are               | Scope                                                       |
| ----------- | -------------------------- | ----------------------------------------------------------- |
| `PLATFORM`  | Ekoru staff accounts       | Full CRUD across the platform database (users, content, …)  |
| `BUSINESS`  | Business owners / managers | **Only their own business data**, keyed by `admin.sellerId` |

This maps directly to the product requirement: _Ekoru accounts maintain the
database; business accounts handle their own business data only._

## Two layers of access

1. **`adminType`** — the coarse switch. PLATFORM sees platform sections; BUSINESS
   sees the business area. Enforced in the sidebar (`features/dashboard/constants/nav.ts`)
   and on each screen via `<PermissionGate adminType="…">`.
2. **`permissions[]` / `role`** — fine-grained capabilities the gateway grants.
   `SUPER_ADMIN` implicitly passes every permission check; everyone else needs the
   explicit grant.

The single source of truth for "can this admin do X" is
[`utils/permissions.ts`](../utils/permissions.ts):

```ts
isPlatformAdmin(admin); // adminType === "PLATFORM"
isBusinessAdmin(admin); // adminType === "BUSINESS"
hasPermission(admin, "MANAGE_USERS"); // SUPER_ADMIN always true
```

Store selectors wrap these for components:
`useIsPlatformAdmin()`, `useCan("MANAGE_USERS")`, `useScopedSellerId()`.

## Roles

```
PLATFORM:  SUPER_ADMIN · MODERATOR · CONTENT_MANAGER · SUPPORT
BUSINESS:  BUSINESS_OWNER · BUSINESS_MANAGER · BUSINESS_ANALYST · BUSINESS_SUPPORT
```

## Permissions (excerpt)

Platform-wide: `MANAGE_USERS`, `BAN_USERS`, `VIEW_USER_DATA`, `WRITE_BLOG`,
`PUBLISH_BLOG`, `MODERATE_CONTENT`, `MANAGE_CATEGORIES`, `MANAGE_PRODUCTS`,
`VIEW_ANALYTICS`, `MANAGE_ADMINS`, `MANAGE_SETTINGS`, …

Business-scoped: `MANAGE_BUSINESS_PROFILE`, `MANAGE_BUSINESS_TEAM`,
`VIEW_BUSINESS_ANALYTICS`, `MANAGE_BUSINESS_PRODUCTS`, `MANAGE_BUSINESS_ORDERS`.

Full list: [`types/enums.ts`](../types/enums.ts).

## How a section is gated

The Users section is platform-only and requires `MANAGE_USERS`:

```tsx
// features/users/ui/UsersScreen.tsx
<PermissionGate
  adminType="PLATFORM"
  permission="MANAGE_USERS"
  fallback={<AccessDenied />}
>
  {/* … */}
</PermissionGate>
```

The same item is filtered out of the sidebar for anyone who can't see it
(`filterNav` in `features/dashboard/constants/nav.ts`), so business admins never
even see a link to it.

## ⚠️ Client gating is UX, not security

`<PermissionGate>`, sidebar filtering, and the `proxy.ts` cookie check are
convenience/UX guards. **The gateway is the security boundary** — every GraphQL
query and mutation must independently authorize the caller's `adminType`, `role`,
`permissions`, and (for BUSINESS admins) ownership of the `sellerId` being acted
on. A BUSINESS admin must never be able to read or mutate another business's data
even if they craft the request by hand.
