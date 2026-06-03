import type { Admin } from "@/types/admin";
import type { AdminPermission, AdminType } from "@/types/enums";

/**
 * Pure, framework-agnostic access-control helpers shared by the auth store, the
 * <PermissionGate> component, and server route guards. Keep this the single
 * source of truth for "can this admin do X" so client and server stay in sync.
 *
 * The model has two layers (see docs/ADMIN_ROLES.md):
 *   1. `adminType` — PLATFORM (Ekoru staff, database-wide) vs BUSINESS (own data only).
 *   2. `permissions[]` — fine-grained capabilities the gateway grants per role.
 */

export const isPlatformAdmin = (admin: Admin | null): boolean =>
  admin?.adminType === "PLATFORM";

export const isBusinessAdmin = (admin: Admin | null): boolean =>
  admin?.adminType === "BUSINESS";

export const hasPermission = (
  admin: Admin | null,
  permission: AdminPermission,
): boolean => {
  if (!admin) return false;
  // SUPER_ADMIN is unconditional; everyone else needs the explicit grant.
  if (admin.role === "SUPER_ADMIN") return true;
  return admin.permissions.includes(permission);
};

export const hasAnyPermission = (
  admin: Admin | null,
  permissions: AdminPermission[],
): boolean => permissions.some((p) => hasPermission(admin, p));

export const hasAdminType = (admin: Admin | null, type: AdminType): boolean =>
  admin?.adminType === type;
