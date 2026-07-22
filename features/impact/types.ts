/**
 * Types for the marketplace impact admin feature. They mirror the raw
 * admin-only GraphQL surface of ekoru-marketplace (AdminImpactResolver): rows
 * exactly as stored, every translation attached.
 *
 * Three tables: MaterialImpactEstimate (a material key + CO2/water savings) and
 * the Water / CO2 impact-message ranges (min/max + three messages). Water and
 * CO2 are identical in shape, so the panel treats them as one "message kind"
 * (`ImpactMessageKind`); their translation parent-id is aliased to `parentId`.
 */

export const CATALOG_LANGUAGES = ["ES", "EN", "FR", "PT", "DE"] as const;
export type CatalogLanguage = (typeof CATALOG_LANGUAGES)[number];

export type ImpactMessageKind = "water" | "co2";

export type RawCatalogPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

// ─── Material impact estimates ────────────────────────────────────────────────

export type MaterialImpactTranslation = {
  id: number;
  materialImpactEstimateId: number;
  language: CatalogLanguage;
  materialTypeTranslation: string;
};

export type RawMaterialImpact = {
  id: number;
  materialType: string;
  estimatedCo2SavingsKG: number;
  estimatedWaterSavingsLT: number;
  createdAt: string;
  updatedAt: string;
  translations: MaterialImpactTranslation[];
};

export type MaterialImpactUpsertRow = {
  id?: number;
  materialType?: string;
  estimatedCo2SavingsKG?: number;
  estimatedWaterSavingsLT?: number;
};

export type MaterialImpactTranslationUpsertRow = {
  id?: number;
  materialImpactEstimateId?: number;
  language?: CatalogLanguage;
  materialTypeTranslation?: string;
};

// ─── Impact messages (water / co2 share this shape) ────────────────────────────

export type ImpactMessageTranslation = {
  id: number;
  parentId: number;
  language: CatalogLanguage;
  message1: string;
  message2: string;
  message3: string;
};

export type RawImpactMessage = {
  id: number;
  min: number;
  max: number;
  message1: string;
  message2: string;
  message3: string;
  createdAt: string;
  updatedAt: string;
  translations: ImpactMessageTranslation[];
};

export type ImpactMessageUpsertRow = {
  id?: number;
  min?: number;
  max?: number;
  message1?: string;
  message2?: string;
  message3?: string;
};

/**
 * Message translation write row. The parent-id key is spelled per kind
 * (`waterImpactMessageId` / `co2ImpactMessageId`); the hook fills the right one.
 */
export type ImpactMessageTranslationUpsertRow = {
  id?: number;
  waterImpactMessageId?: number;
  co2ImpactMessageId?: number;
  language?: CatalogLanguage;
  message1?: string;
  message2?: string;
  message3?: string;
};

/** Parent-id column name for a message-kind translation table. */
export const messageParentKey = (kind: ImpactMessageKind) =>
  kind === "water" ? "waterImpactMessageId" : "co2ImpactMessageId";

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
