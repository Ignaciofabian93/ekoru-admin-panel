import type { Admin, AdminConnection } from "@/types/admin";
import type { AdminPermission, AdminRole, AdminType } from "@/types/enums";

export type AdminsListResult = { getAdmins: AdminConnection };
export type AdminResult = { getAdmin: Admin | null };

/** Mirrors RegisterAdminInput in ekoru-users. */
export type RegisterAdminInput = {
  email: string;
  name: string;
  lastName?: string;
  password: string;
  adminType: AdminType;
  role: AdminRole;
  permissions: AdminPermission[];
  sellerId?: string;
};

/** Mirrors UpdateAdminInput in ekoru-users (all fields optional). */
export type UpdateAdminInput = {
  name?: string;
  lastName?: string;
  adminType?: AdminType;
  role?: AdminRole;
  permissions?: AdminPermission[];
  sellerId?: string;
};

/** Human-readable name for an admin row. */
export const adminDisplayName = (admin: Admin): string =>
  [admin.name, admin.lastName].filter(Boolean).join(" ") || admin.email;
