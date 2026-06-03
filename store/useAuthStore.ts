"use client";

import { create } from "zustand";
import type { Admin } from "@/types/admin";
import type { AdminPermission, AdminType } from "@/types/enums";
import {
  hasPermission as hasPermissionFn,
  isBusinessAdmin as isBusinessAdminFn,
  isPlatformAdmin as isPlatformAdminFn,
} from "@/utils/permissions";
import { formatInitials } from "@/utils/formatters";

// Admin auth uses HttpOnly cookies set by the gateway via the Next.js proxy.
// Tokens are never held in JS — this store only caches the authenticated admin
// for the session (refilled on hydrate by the `getMyData` GraphQL call once the
// cookies are present). Mirrors the web app's useAuthStore shape.
interface AuthState {
  admin: Admin | null;
  isHydrated: boolean;

  setAdmin: (admin: Admin | null) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}

const useAuthStore = create<AuthState>()((set) => ({
  admin: null,
  isHydrated: false,

  setAdmin: (admin) => set({ admin }),
  logout: () => set({ admin: null }),
  setHydrated: (value) => set({ isHydrated: value }),
}));

// ── Selectors ─────────────────────────────────────────────────────────
export const useAdmin = () => useAuthStore((s) => s.admin);

export const useIsAuthenticated = () => useAuthStore((s) => s.admin !== null);

export const useIsHydrated = () => useAuthStore((s) => s.isHydrated);

export const useAdminType = (): AdminType | null =>
  useAuthStore((s) => s.admin?.adminType ?? null);

export const useAdminRole = () => useAuthStore((s) => s.admin?.role ?? null);

export const useIsPlatformAdmin = () => useAuthStore((s) => isPlatformAdminFn(s.admin));

export const useIsBusinessAdmin = () => useAuthStore((s) => isBusinessAdminFn(s.admin));

/** True when the admin holds the given permission (SUPER_ADMIN always passes). */
export const useCan = (permission: AdminPermission) =>
  useAuthStore((s) => hasPermissionFn(s.admin, permission));

/** The seller id a BUSINESS admin is scoped to; null for platform admins. */
export const useScopedSellerId = () => useAuthStore((s) => s.admin?.sellerId ?? null);

export const useAdminEmail = () => useAuthStore((s) => s.admin?.email);

export const useDisplayName = () =>
  useAuthStore((s) => {
    const admin = s.admin;
    if (!admin) return "";
    return [admin.name, admin.lastName].filter(Boolean).join(" ") || admin.email;
  });

export const useInitials = () =>
  useAuthStore((s) => {
    const admin = s.admin;
    if (!admin) return "";
    const name = [admin.name, admin.lastName].filter(Boolean).join(" ");
    return formatInitials(name || admin.email);
  });

export default useAuthStore;
