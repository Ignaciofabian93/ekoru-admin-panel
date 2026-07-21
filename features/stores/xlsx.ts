import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import {
  CATALOG_LANGUAGES,
  PRODUCT_SIZES,
  WEIGHT_UNITS,
  type CatalogLanguage,
  type ProductSize,
  type RawStoreCategory,
  type RawStoreSubCategory,
  type StoreCategoryTranslationUpsertRow,
  type StoreCategoryUpsertRow,
  type StoreSubCategoryTranslationUpsertRow,
  type StoreSubCategoryUpsertRow,
  type WeightUnit,
} from "./types";

/**
 * XLSX round-trip for the store catalog tables.
 *
 * Every export produces one workbook with two tabs — `data` (base rows) and
 * `translations` — whose headers are the raw backend field names, so an edited
 * file can be re-imported as-is. Extra columns (`createdAt`, `name (read-only)`)
 * are export-only conveniences the import mappers ignore. List cells are joined
 * with " | " and split back on "|" or newline.
 */

export const DATA_SHEET = "data";
export const TRANSLATIONS_SHEET = "translations";

const joinList = (values: string[] | null | undefined) => (values ?? []).join(" | ");

/** First available name, purely as a human reference column in the data tab. */
const referenceName = (row: { translations: { language: string; name: string }[] }) =>
  row.translations.find((t) => t.language === "ES")?.name ??
  row.translations[0]?.name ??
  "";

// ─── Export builders ─────────────────────────────────────────────────────────

export function buildStoreCategorySheets(rows: RawStoreCategory[]): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "name (read-only)", value: referenceName },
        { header: "isActive", value: (r) => r.isActive },
        { header: "sortOrder", value: (r) => r.sortOrder },
        { header: "featuredFrom", value: (r) => r.featuredFrom },
        { header: "featuredUntil", value: (r) => r.featuredUntil },
        { header: "createdAt", value: (r) => r.createdAt },
        { header: "updatedAt", value: (r) => r.updatedAt },
      ],
    }),
    buildSheet({
      name: TRANSLATIONS_SHEET,
      rows: rows.flatMap((r) => r.translations),
      columns: [
        { header: "id", value: (t) => t.id },
        { header: "storeCategoryId", value: (t) => t.storeCategoryId },
        { header: "language", value: (t) => t.language },
        { header: "name", value: (t) => t.name },
        { header: "slug", value: (t) => t.slug },
        { header: "href", value: (t) => t.href },
        { header: "metaTitle", value: (t) => t.metaTitle },
        { header: "metaDescription", value: (t) => t.metaDescription },
        { header: "metaKeywords", value: (t) => joinList(t.metaKeywords) },
      ],
    }),
  ];
}

export function buildStoreSubCategorySheets(rows: RawStoreSubCategory[]): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "name (read-only)", value: referenceName },
        { header: "storeCategoryId", value: (r) => r.storeCategoryId },
        { header: "averageWeight", value: (r) => r.averageWeight },
        { header: "size", value: (r) => r.size },
        { header: "weightUnit", value: (r) => r.weightUnit },
        { header: "isActive", value: (r) => r.isActive },
        { header: "sortOrder", value: (r) => r.sortOrder },
        { header: "featuredFrom", value: (r) => r.featuredFrom },
        { header: "featuredUntil", value: (r) => r.featuredUntil },
        { header: "createdAt", value: (r) => r.createdAt },
        { header: "updatedAt", value: (r) => r.updatedAt },
      ],
    }),
    buildSheet({
      name: TRANSLATIONS_SHEET,
      rows: rows.flatMap((r) => r.translations),
      columns: [
        { header: "id", value: (t) => t.id },
        { header: "storeSubCategoryId", value: (t) => t.storeSubCategoryId },
        { header: "language", value: (t) => t.language },
        { header: "name", value: (t) => t.name },
        { header: "slug", value: (t) => t.slug },
        { header: "keywords", value: (t) => joinList(t.keywords) },
        { header: "href", value: (t) => t.href },
        { header: "metaTitle", value: (t) => t.metaTitle },
        { header: "metaDescription", value: (t) => t.metaDescription },
      ],
    }),
  ];
}

// ─── Import cell coercion ─────────────────────────────────────────────────────
// Empty cells mean "leave unchanged" and map to undefined; malformed values
// throw with a message that names the column so the dialog can report the exact
// spreadsheet line.

const cell = (row: Record<string, string>, key: string): string =>
  (row[key] ?? "").trim();

function intCell(row: Record<string, string>, key: string): number | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error(`${key}: "${v}" is not an integer`);
  return n;
}

function floatCell(row: Record<string, string>, key: string): number | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`${key}: "${v}" is not a number`);
  return n;
}

function boolCell(row: Record<string, string>, key: string): boolean | undefined {
  const v = cell(row, key).toLowerCase();
  if (v === "") return undefined;
  if (["true", "1", "yes", "si", "sí", "x"].includes(v)) return true;
  if (["false", "0", "no"].includes(v)) return false;
  throw new Error(`${key}: "${v}" is not a boolean (use TRUE/FALSE)`);
}

function dateCell(row: Record<string, string>, key: string): string | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) throw new Error(`${key}: "${v}" is not a valid date`);
  return date.toISOString();
}

function listCell(row: Record<string, string>, key: string): string[] | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  return v
    .split(/[|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function stringCell(row: Record<string, string>, key: string): string | undefined {
  const v = cell(row, key);
  return v === "" ? undefined : v;
}

function enumCell<T extends string>(
  row: Record<string, string>,
  key: string,
  allowed: readonly T[],
): T | undefined {
  const v = cell(row, key).toUpperCase();
  if (v === "") return undefined;
  if (!allowed.includes(v as T))
    throw new Error(`${key}: "${v}" must be one of ${allowed.join(", ")}`);
  return v as T;
}

// ─── Import row mappers ───────────────────────────────────────────────────────

export function mapStoreCategoryDataRow(
  row: Record<string, string>,
): StoreCategoryUpsertRow {
  return {
    id: intCell(row, "id"),
    isActive: boolCell(row, "isActive"),
    sortOrder: intCell(row, "sortOrder"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}

export function mapStoreCategoryTranslationRow(
  row: Record<string, string>,
): StoreCategoryTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    storeCategoryId: intCell(row, "storeCategoryId"),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    name: stringCell(row, "name"),
    slug: stringCell(row, "slug"),
    href: stringCell(row, "href"),
    metaTitle: stringCell(row, "metaTitle"),
    metaDescription: stringCell(row, "metaDescription"),
    metaKeywords: listCell(row, "metaKeywords"),
  };
}

export function mapStoreSubCategoryDataRow(
  row: Record<string, string>,
): StoreSubCategoryUpsertRow {
  return {
    id: intCell(row, "id"),
    storeCategoryId: intCell(row, "storeCategoryId"),
    averageWeight: floatCell(row, "averageWeight"),
    size: enumCell<ProductSize>(row, "size", PRODUCT_SIZES),
    weightUnit: enumCell<WeightUnit>(row, "weightUnit", WEIGHT_UNITS),
    isActive: boolCell(row, "isActive"),
    sortOrder: intCell(row, "sortOrder"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}

export function mapStoreSubCategoryTranslationRow(
  row: Record<string, string>,
): StoreSubCategoryTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    storeSubCategoryId: intCell(row, "storeSubCategoryId"),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    name: stringCell(row, "name"),
    slug: stringCell(row, "slug"),
    keywords: listCell(row, "keywords"),
    href: stringCell(row, "href"),
    metaTitle: stringCell(row, "metaTitle"),
    metaDescription: stringCell(row, "metaDescription"),
  };
}
