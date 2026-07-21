/**
 * Types for the blog & community catalog admin feature. They mirror the raw
 * admin-only GraphQL surface of ekoru-blog-community (AdminCatalogResolver):
 * rows exactly as stored, every translation attached.
 *
 * The catalog is three independent tables — BlogCategory, CommunityCategory and
 * CommunityCategory → CommunitySubCategory. Their translation tables spell the
 * display-name column differently (`name` / `category` / `subCategory`); the
 * GraphQL queries alias them all to `name`, so the panel treats translations
 * uniformly through {@link CatalogTranslation}.
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
  description: string | null;
  href: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
};

export type BlogCategoryTranslation = CatalogTranslation & {
  blogCategoryId: number;
};
export type CommunityCategoryTranslation = CatalogTranslation & {
  communityCategoryId: number;
};
export type CommunitySubCategoryTranslation = CatalogTranslation & {
  communitySubCategoryId: number;
};

// ─── Rows as stored ───────────────────────────────────────────────────────────

export type RawBlogCategory = {
  id: number;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  translations: BlogCategoryTranslation[];
};

export type RawCommunityCategory = {
  id: number;
  isActive: boolean;
  sortOrder: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  translations: CommunityCategoryTranslation[];
};

export type RawCommunitySubCategory = {
  id: number;
  communityCategoryId: number;
  isActive: boolean;
  sortOrder: number;
  featuredFrom: string | null;
  featuredUntil: string | null;
  createdAt: string;
  updatedAt: string;
  translations: CommunitySubCategoryTranslation[];
};

/** Any of the raw base rows (they all carry `id` + `translations`). */
export type AnyRawRow = RawBlogCategory | RawCommunityCategory | RawCommunitySubCategory;

// ─── Write payloads (mirror the backend *UpsertRowInput types) ────────────────

export type BlogCategoryUpsertRow = {
  id?: number;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
  featuredFrom?: string | null;
  featuredUntil?: string | null;
};

export type BlogCategoryTranslationUpsertRow = {
  id?: number;
  blogCategoryId?: number;
  language?: CatalogLanguage;
  name?: string;
  slug?: string;
  description?: string | null;
  href?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
};

export type CommunityCategoryUpsertRow = {
  id?: number;
  isActive?: boolean;
  sortOrder?: number;
  featuredFrom?: string | null;
  featuredUntil?: string | null;
};

export type CommunityCategoryTranslationUpsertRow = {
  id?: number;
  communityCategoryId?: number;
  language?: CatalogLanguage;
  category?: string;
  slug?: string;
  description?: string | null;
  href?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
};

export type CommunitySubCategoryUpsertRow = {
  id?: number;
  communityCategoryId?: number;
  isActive?: boolean;
  sortOrder?: number;
  featuredFrom?: string | null;
  featuredUntil?: string | null;
};

export type CommunitySubCategoryTranslationUpsertRow = {
  id?: number;
  communitySubCategoryId?: number;
  language?: CatalogLanguage;
  subCategory?: string;
  slug?: string;
  description?: string | null;
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
