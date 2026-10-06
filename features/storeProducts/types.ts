/**
 * Types for the store-products admin feature. They mirror the raw admin-only
 * GraphQL surface of ekoru-stores (AdminStoreProductResolver): the whole
 * StoreProduct catalog exactly as stored, inactive and soft-deleted included.
 *
 * StoreProduct is a flat, single-language table (no translations); engagement
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

export const WEIGHT_UNITS = ["KG", "LB", "OZ", "G"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type ProductSize = (typeof PRODUCT_SIZES)[number];

export const DIMENSION_UNITS = ["CM", "M", "MM", "INCH", "FOOT"] as const;
export type DimensionUnit = (typeof DIMENSION_UNITS)[number];

export type RawCatalogPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

export type StoreProductMaterial = {
  id: number;
  storeProductId: number;
  materialTypeId: number;
  /** Related material's name, denormalized for display (read-only). */
  materialType: string | null;
  percentage: number;
};

export type StoreProductMaterialUpsertRow = {
  id?: number;
  storeProductId?: number;
  materialTypeId?: number;
  percentage?: number;
};

export type ProductVariant = {
  id: number;
  storeProductId: number;
  name: string;
  price: number;
  stock: number;
  color: string | null;
  size: string;
};

export type ProductVariantUpsertRow = {
  id?: number;
  storeProductId?: number;
  name?: string;
  price?: number;
  stock?: number;
  color?: string | null;
  size?: string;
};

export type RawStoreProduct = {
  id: number;
  name: string;
  description: string;
  stock: number;
  barcode: string | null;
  sku: string | null;
  price: number;
  hasOffer: boolean;
  offerPrice: number | null;
  sellerId: string;
  images: string[];
  isActive: boolean;
  badges: Badge[];
  brand: string | null;
  color: string | null;
  averageRating: number;
  reviewsNumber: number;
  likesCount: number;
  saleCount: number;
  viewCount: number;
  materialComposition: string | null;
  recycledContent: number | null;
  weight: number | null;
  weightUnit: WeightUnit | null;
  size: ProductSize | null;
  length: number | null;
  width: number | null;
  height: number | null;
  dimensionUnit: DimensionUnit | null;
  lowStockThreshold: number | null;
  isLowStock: boolean;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  warranty: boolean | null;
  warrantyDuration: number | null;
  features: string[];
  subCategoryId: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  materials: StoreProductMaterial[];
  variants: ProductVariant[];
};

export type StoreProductUpsertRow = {
  id?: number;
  name?: string;
  description?: string;
  stock?: number;
  barcode?: string | null;
  sku?: string | null;
  price?: number;
  hasOffer?: boolean;
  offerPrice?: number | null;
  sellerId?: string;
  images?: string[];
  isActive?: boolean;
  badges?: Badge[];
  brand?: string | null;
  color?: string | null;
  materialComposition?: string | null;
  recycledContent?: number | null;
  weight?: number | null;
  weightUnit?: WeightUnit | null;
  size?: ProductSize | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  dimensionUnit?: DimensionUnit | null;
  lowStockThreshold?: number | null;
  isLowStock?: boolean;
  tags?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  warranty?: boolean | null;
  warrantyDuration?: number | null;
  features?: string[];
  subCategoryId?: number;
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
