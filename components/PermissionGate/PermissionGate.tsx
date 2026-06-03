"use client";

import { useCan, useAdminType, useIsHydrated } from "@/store/useAuthStore";
import type { AdminPermission, AdminType } from "@/types/enums";

/**
 * Client-side access gate. Renders `children` only when the authenticated admin
 * satisfies BOTH constraints that are provided:
 *   - `permission` — the admin holds it (SUPER_ADMIN always passes).
 *   - `adminType`  — the admin's type matches (e.g. "PLATFORM").
 *
 * This is a UX guard, not a security boundary — the gateway is the source of
 * truth and must authorize every query/mutation independently.
 *
 * @example
 * <PermissionGate adminType="PLATFORM" permission="MANAGE_USERS">
 *   <DeleteSellerButton />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  adminType,
  fallback = null,
  children,
}: {
  permission?: AdminPermission;
  adminType?: AdminType;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const isHydrated = useIsHydrated();
  const currentType = useAdminType();
  const can = useCan(permission ?? "VIEW_USER_DATA");

  // Avoid flashing protected UI before the admin profile has hydrated.
  if (!isHydrated) return <>{fallback}</>;

  if (adminType && currentType !== adminType) return <>{fallback}</>;
  if (permission && !can) return <>{fallback}</>;

  return <>{children}</>;
}
