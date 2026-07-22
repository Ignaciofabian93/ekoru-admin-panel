/**
 * Types for the marketplace-products admin feature. They mirror the raw
 * admin-only GraphQL surface of ekoru-marketplace (AdminProductResolver): the
 * whole Product catalog exactly as stored, inactive and soft-deleted included.
 *
 * Product is a flat, single-language table (no translations); engagement
 * metrics and `deletedAt` are read-only (not part of the upsert input).
 */

export const BADGES = [
  "POPULAR",
  "DISCOUNTED",
  "WOMAN_OWNED",
  "BEST_SELLER",
  "TOP_RATED",
  "COMMUNITY_FAVORITE",
  "LIMITED_TIME_OFFER",
  "FLASH_SALE",
  "BEST_VALUE",
  "HANDMADE",
  "SUSTAINABLE",
  "SUPPORTS_CAUSE",
  "FAMILY_BUSINESS",
  "CHARITY_SUPPORT",
  "LIMITED_STOCK",
  "SEASONAL",
  "FREE_SHIPPING",
  "FOR_REPAIR",
  "REFURBISHED",
  "EXCHANGEABLE",
  "LAST_PRICE",
  "FOR_GIFT",
  "OPEN_TO_OFFERS",
  "OPEN_BOX",
  "CRUELTY_FREE",
  "DELIVERED_TO_HOME",
  "IN_HOUSE_PICKUP",
  "IN_MID_POINT_PICKUP",
] as const;
export type Badge = (typeof BADGES)[number];

export const PRODUCT_CONDITIONS = [
  "NEW",
  "OPEN_BOX",
  "LIKE_NEW",
  "FAIR",
  "POOR",
  "FOR_PARTS",
  "REFURBISHED",
] as const;
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];

export type RawCatalogPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

export type RawProduct = {
  id: number;
  name: string;
  description: string;
  color: string | null;
  images: string[];
  brand: string;
  price: number;
  productCategoryId: number;
  badges: Badge[];
  interests: string[];
  condition: ProductCondition;
  conditionDescription: string | null;
  isActive: boolean;
  isExchangeable: boolean;
  sellerId: string;
  viewCount: number;
  likesCount: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ProductUpsertRow = {
  id?: number;
  name?: string;
  description?: string;
  color?: string | null;
  images?: string[];
  brand?: string;
  price?: number;
  productCategoryId?: number;
  badges?: Badge[];
  interests?: string[];
  condition?: ProductCondition;
  conditionDescription?: string | null;
  isActive?: boolean;
  isExchangeable?: boolean;
  sellerId?: string;
  featuredFrom?: string | null;
  featuredUntil?: string | null;
};

export type BulkRowError = {
  index: number;
  id: number | null;
  message: string;
};

export type BulkUpsertResult = {
  created: number;
  createdIds: number[];
  updated: number;
  failed: number;
  errors: BulkRowError[];
};
