import type { AdminPermission, AdminRole, AdminType } from "./enums";
import type { City, Country, County, Region } from "./location";
import type { Seller } from "./user";

/**
 * The authenticated administrator. `adminType` is the top-level access switch:
 * - `PLATFORM` → Ekoru staff, full database reach (gated further by `role`/`permissions`).
 * - `BUSINESS` → scoped to a single seller via `sellerId`; sees only that business.
 *
 * See docs/ADMIN_ROLES.md.
 */
export type Admin = {
  id: string;
  email: string;
  name: string;
  lastName?: string;

  // Access control
  adminType: AdminType;
  role: AdminRole;
  permissions: AdminPermission[];

  // Location
  countryId?: number;
  country?: Country;
  regionId?: number;
  region?: Region;
  cityId?: number;
  city?: City;
  countyId?: number;
  county?: County;

  // Business admin relation (null for platform admins)
  sellerId?: string;
  seller?: Seller;

  // Account status and security
  isActive: boolean;
  isEmailVerified: boolean;
  accountLocked: boolean;
  lastLoginAt?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
};

export type AdminActivityLog = {
  id: number;
  adminId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};
