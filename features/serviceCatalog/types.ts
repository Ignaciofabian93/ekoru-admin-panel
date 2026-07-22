/**
 * Types for the service catalog admin feature. They mirror the raw admin-only
 * GraphQL surface of ekoru-services (AdminCatalogResolver): rows exactly as
 * stored, every translation attached.
 *
 * Two tables: ServiceCategory → ServiceSubCategory. Their translation tables
 * spell the display-name column differently (`category` / `subCategory`); the
 * GraphQL queries alias both to `name`, so the panel treats translations
 * uniformly through {@link CatalogTranslation}. Service translations have no
 * `description` field.
 */

export const CATALOG_LANGUAGES = ["ES", "EN", "FR", "PT", "DE"] as const;
export type CatalogLanguage = (typeof CATALOG_LANGUAGES)[number];

export type RawCatalogPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

// ─── Translations as stored (name normalized via GraphQL alias) ────────────────

export type CatalogTranslation = {
  id: number;
  language: CatalogLanguage;
  name: string;
  slug: string;
  href: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
};

export type ServiceCategoryTranslation = CatalogTranslation & {
  serviceCategoryId: number;
};
export type ServiceSubCategoryTranslation = CatalogTranslation & {
  serviceSubCategoryId: number;
};

// ─── Rows as stored ───────────────────────────────────────────────────────────

export type RawServiceCategory = {
  id: number;
  isActive: boolean;
  sortOrder: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  translations: ServiceCategoryTranslation[];
};

export type RawServiceSubCategory = {
  id: number;
  serviceCategoryId: number;
  isActive: boolean;
  sortOrder: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  translations: ServiceSubCategoryTranslation[];
};

/** Any of the raw base rows (they all carry `id` + `translations`). */
export type AnyRawRow = RawServiceCategory | RawServiceSubCategory;

// ─── Write payloads (mirror the backend *UpsertRowInput types) ────────────────

export type ServiceCategoryUpsertRow = {
  id?: number;
  isActive?: boolean;
  sortOrder?: number;
  featuredFrom?: string | null;
  featuredUntil?: string | null;
};

export type ServiceCategoryTranslationUpsertRow = {
  id?: number;
  serviceCategoryId?: number;
  language?: CatalogLanguage;
  category?: string;
  slug?: string;
  href?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
};

export type ServiceSubCategoryUpsertRow = {
  id?: number;
  serviceCategoryId?: number;
  isActive?: boolean;
  sortOrder?: number;
  featuredFrom?: string | null;
  featuredUntil?: string | null;
};

export type ServiceSubCategoryTranslationUpsertRow = {
  id?: number;
  serviceSubCategoryId?: number;
  language?: CatalogLanguage;
  subCategory?: string;
  slug?: string;
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
