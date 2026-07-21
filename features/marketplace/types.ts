/**
 * Types for the marketplace catalog admin feature. They mirror the raw
 * admin-only GraphQL surface of ekoru-marketplace (AdminCatalogResolver):
 * rows exactly as stored, every translation attached.
 */

/** Every backend Language value — the catalog tables translate into all five. */
export const CATALOG_LANGUAGES = ["ES", "EN", "FR", "PT", "DE"] as const;
export type CatalogLanguage = (typeof CATALOG_LANGUAGES)[number];

export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type ProductSize = (typeof PRODUCT_SIZES)[number];

export const WEIGHT_UNITS = ["KG", "G", "LB", "OZ"] as const;
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

export type DepartmentTranslation = {
  id: number;
  departmentId: number;
  language: CatalogLanguage;
  name: string;
  slug: string;
  href: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
};

export type RawDepartment = {
  id: number;
  isActive: boolean;
  sortOrder: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  translations: DepartmentTranslation[];
};

export type DepartmentCategoryTranslation = {
  id: number;
  departmentCategoryId: number;
  language: CatalogLanguage;
  name: string;
  slug: string;
  href: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
};

export type RawDepartmentCategory = {
  id: number;
  departmentId: number;
  isActive: boolean;
  sortOrder: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  translations: DepartmentCategoryTranslation[];
};

export type ProductCategoryTranslation = {
  id: number;
  productCategoryId: number;
  language: CatalogLanguage;
  name: string;
  slug: string;
  keywords: string[];
  href: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
};

export type RawProductCategory = {
  id: number;
  departmentCategoryId: number;
  averageWeight: number | null;
  size: ProductSize | null;
  weightUnit: WeightUnit | null;
  isActive: boolean;
  sortOrder: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  translations: ProductCategoryTranslation[];
};

/** Any of the three raw base rows (they all carry `id` + `translations`). */
export type AnyRawRow = RawDepartment | RawDepartmentCategory | RawProductCategory;

// ─── Write payloads (mirror the backend *UpsertRowInput types) ────────────────

export type DepartmentUpsertRow = {
  id?: number;
  isActive?: boolean;
  sortOrder?: number;
  featuredFrom?: string | null;
  featuredUntil?: string | null;
};

export type DepartmentTranslationUpsertRow = {
  id?: number;
  departmentId?: number;
  language?: CatalogLanguage;
  name?: string;
  slug?: string;
  href?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
};

export type DepartmentCategoryUpsertRow = {
  id?: number;
  departmentId?: number;
  isActive?: boolean;
  sortOrder?: number;
  featuredFrom?: string | null;
  featuredUntil?: string | null;
};

export type DepartmentCategoryTranslationUpsertRow = {
  id?: number;
  departmentCategoryId?: number;
  language?: CatalogLanguage;
  name?: string;
  slug?: string;
  href?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
};

export type ProductCategoryUpsertRow = {
  id?: number;
  departmentCategoryId?: number;
  averageWeight?: number | null;
  size?: ProductSize | null;
  weightUnit?: WeightUnit | null;
  isActive?: boolean;
  sortOrder?: number;
  featuredFrom?: string | null;
  featuredUntil?: string | null;
};

export type ProductCategoryTranslationUpsertRow = {
  id?: number;
  productCategoryId?: number;
  language?: CatalogLanguage;
  name?: string;
  slug?: string;
  keywords?: string[];
  href?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
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
