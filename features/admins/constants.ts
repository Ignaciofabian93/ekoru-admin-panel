import type { AdminPermission, AdminRole, AdminType } from "@/types/enums";

export const ADMIN_TYPES: AdminType[] = ["PLATFORM", "BUSINESS"];

export const ADMIN_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "MODERATOR",
  "CONTENT_MANAGER",
  "SUPPORT",
  "BUSINESS_OWNER",
  "BUSINESS_MANAGER",
  "BUSINESS_ANALYST",
  "BUSINESS_SUPPORT",
];

/**
 * Permissions grouped the same way as the backend enum comments
 * (ekoru-users graphql/enums). Group headings are translated; individual
 * permission labels are humanized from the enum token.
 */
export const ADMIN_PERMISSION_GROUPS: {
  group: string;
  permissions: AdminPermission[];
}[] = [
  {
    group: "products",
    permissions: ["MANAGE_PRODUCTS", "APPROVE_PRODUCTS", "DELETE_PRODUCTS"],
  },
  {
    group: "content",
    permissions: ["WRITE_BLOG", "PUBLISH_BLOG", "DELETE_BLOG", "MODERATE_CONTENT"],
  },
  {
    group: "users",
    permissions: ["MANAGE_USERS", "BAN_USERS", "VIEW_USER_DATA"],
  },
  {
    group: "orders",
    permissions: [
      "MANAGE_ORDERS",
      "PROCESS_REFUNDS",
      "VIEW_TRANSACTIONS",
      "VIEW_ANALYTICS",
      "EXPORT_DATA",
    ],
  },
  {
    group: "platform",
    permissions: [
      "MANAGE_ADMINS",
      "MANAGE_CATEGORIES",
      "MANAGE_SETTINGS",
      "VIEW_SYSTEM_LOGS",
    ],
  },
  {
    group: "business",
    permissions: [
      "MANAGE_BUSINESS_PROFILE",
      "MANAGE_BUSINESS_TEAM",
      "VIEW_BUSINESS_ANALYTICS",
      "MANAGE_BUSINESS_PRODUCTS",
      "MANAGE_BUSINESS_ORDERS",
    ],
  },
];

export const ADMIN_PERMISSIONS: AdminPermission[] = ADMIN_PERMISSION_GROUPS.flatMap(
  (g) => g.permissions,
);
