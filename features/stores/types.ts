/**
 * Types for the store catalog admin feature. They mirror the raw admin-only
 * GraphQL surface of ekoru-stores (AdminCatalogResolver): rows exactly as
 * stored, every translation attached.
 *
 * Note the store catalog is two levels — StoreCategory → StoreSubCategory —
 * and their translation tables differ: category translations carry
 * `metaKeywords`, sub category translations carry `keywords`.
 */

export const CATALOG_LANGUAGES = ["ES", "EN", "FR", "PT", "DE"] as const;
export type CatalogLanguage = (typeof CATALOG_LANGUAGES)[number];

export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type ProductSize = (typeof PRODUCT_SIZES)[number];

export const WEIGHT_UNITS = ["KG", "LB", "OZ", "G"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export type RawCatalogPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

// ─── Rows as stored ───────────────────────────────────────────────────────────

export type StoreCategoryTranslation = {
  id: number;
  storeCategoryId: number;
  language: CatalogLanguage;
  name: string;
  slug: string;
  href: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
};

export type RawStoreCategory = {
  id: number;
  isActive: boolean;
  sortOrder: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  translations: StoreCategoryTranslation[];
};

export type StoreSubCategoryTranslation = {
  id: number;
  storeSubCategoryId: number;
  language: CatalogLanguage;
  name: string;
  slug: string;
  keywords: string[];
  href: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type RawStoreSubCategory = {
  id: number;
  storeCategoryId: number;
  averageWeight: number | null;
  size: ProductSize | null;
  weightUnit: WeightUnit | null;
  isActive: boolean;
  sortOrder: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  translations: StoreSubCategoryTranslation[];
};

/** Any of the raw base rows (they all carry `id` + `translations`). */
export type AnyRawRow = RawStoreCategory | RawStoreSubCategory;

// ─── Write payloads (mirror the backend *UpsertRowInput types) ────────────────

export type StoreCategoryUpsertRow = {
  id?: number;
  isActive?: boolean;
  sortOrder?: number;
  featuredFrom?: string | null;
  featuredUntil?: string | null;
};

export type StoreCategoryTranslationUpsertRow = {
  id?: number;
  storeCategoryId?: number;
  language?: CatalogLanguage;
  name?: string;
  slug?: string;
  href?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
};

export type StoreSubCategoryUpsertRow = {
  id?: number;
  storeCategoryId?: number;
  averageWeight?: number | null;
  size?: ProductSize | null;
  weightUnit?: WeightUnit | null;
  isActive?: boolean;
  sortOrder?: number;
  featuredFrom?: string | null;
  featuredUntil?: string | null;
};

export type StoreSubCategoryTranslationUpsertRow = {
  id?: number;
  storeSubCategoryId?: number;
  language?: CatalogLanguage;
  name?: string;
  slug?: string;
  keywords?: string[];
  href?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

// ─── Bulk results ─────────────────────────────────────────────────────────────

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

/**
 * Preferred display name for a raw row: the active UI language first, then
 * Spanish (the platform default), then whatever translation exists.
 */
export function displayName(row: AnyRawRow, language: CatalogLanguage): string {
  const byLang = (l: CatalogLanguage) =>
    row.translations.find((t) => t.language === l)?.name;
  return byLang(language) ?? byLang("ES") ?? row.translations[0]?.name ?? "—";
}
