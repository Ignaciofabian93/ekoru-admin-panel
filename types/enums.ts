// ── Admin access control ──────────────────────────────────────────────
// `PLATFORM` admins are Ekoru staff accounts with database-wide reach.
// `BUSINESS` admins are scoped to a single seller's own business data.
export type AdminType = "PLATFORM" | "BUSINESS";

export type AdminRole =
  | "SUPER_ADMIN"
  | "MODERATOR"
  | "CONTENT_MANAGER"
  | "SUPPORT"
  | "BUSINESS_OWNER"
  | "BUSINESS_MANAGER"
  | "BUSINESS_ANALYST"
  | "BUSINESS_SUPPORT";

export type AdminPermission =
  | "MANAGE_PRODUCTS"
  | "APPROVE_PRODUCTS"
  | "DELETE_PRODUCTS"
  | "WRITE_BLOG"
  | "PUBLISH_BLOG"
  | "DELETE_BLOG"
  | "MODERATE_CONTENT"
  | "MANAGE_USERS"
  | "BAN_USERS"
  | "VIEW_USER_DATA"
  | "MANAGE_ORDERS"
  | "PROCESS_REFUNDS"
  | "VIEW_TRANSACTIONS"
  | "VIEW_ANALYTICS"
  | "EXPORT_DATA"
  | "MANAGE_ADMINS"
  | "MANAGE_CATEGORIES"
  | "MANAGE_SETTINGS"
  | "VIEW_SYSTEM_LOGS"
  | "MANAGE_BUSINESS_PROFILE"
  | "MANAGE_BUSINESS_TEAM"
  | "VIEW_BUSINESS_ANALYTICS"
  | "MANAGE_BUSINESS_PRODUCTS"
  | "MANAGE_BUSINESS_ORDERS";

// ── Seller (the accounts platform admins manage) ──────────────────────
export type SellerType = "PERSON" | "STARTUP" | "COMPANY";

export type BusinessType = "RETAIL" | "SERVICES" | "MIXED";

export type BusinessFormalizationStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "IN_PROGRESS"
  | "FORMALIZED";

export type ContactMethod =
  | "EMAIL"
  | "WHATSAPP"
  | "PHONE"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "WEBSITE"
  | "TIKTOK";

// ── Subscription plans ────────────────────────────────────────────────
export type PersonSubscriptionPlan = "FREEMIUM" | "BASIC" | "ADVANCED";

export type BusinessSubscriptionPlan =
  | "FREEMIUM"
  | "STARTUP"
  | "BASIC"
  | "ADVANCED"
  | "EXPERT";
