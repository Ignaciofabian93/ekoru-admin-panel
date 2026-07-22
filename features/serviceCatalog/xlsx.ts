import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import {
  CATALOG_LANGUAGES,
  type CatalogLanguage,
  type RawServiceCategory,
  type RawServiceSubCategory,
  type ServiceCategoryTranslationUpsertRow,
  type ServiceCategoryUpsertRow,
  type ServiceSubCategoryTranslationUpsertRow,
  type ServiceSubCategoryUpsertRow,
} from "./types";

/**
 * XLSX round-trip for the service category tables.
 *
 * Every export produces one workbook with two tabs — `data` (base rows) and
 * `translations` — whose headers are the raw backend field names, so an edited
 * file can be re-imported as-is. Extra columns (`createdAt`, `name (read-only)`)
 * are export-only conveniences the import mappers ignore. The translation name
 * column keeps its per-table backend spelling (`category` / `subCategory`).
 * List cells are joined with " | " and split back on "|" or newline.
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

export function buildServiceCategorySheets(rows: RawServiceCategory[]): BuiltSheet[] {
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
        { header: "serviceCategoryId", value: (t) => t.serviceCategoryId },
        { header: "language", value: (t) => t.language },
        { header: "category", value: (t) => t.name },
        { header: "slug", value: (t) => t.slug },
        { header: "href", value: (t) => t.href },
        { header: "metaTitle", value: (t) => t.metaTitle },
        { header: "metaDescription", value: (t) => t.metaDescription },
        { header: "metaKeywords", value: (t) => joinList(t.metaKeywords) },
      ],
    }),
  ];
}

export function buildServiceSubCategorySheets(
  rows: RawServiceSubCategory[],
): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "name (read-only)", value: referenceName },
        { header: "serviceCategoryId", value: (r) => r.serviceCategoryId },
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
        {
          header: "serviceSubCategoryId",
          value: (t) => t.serviceSubCategoryId,
        },
        { header: "language", value: (t) => t.language },
        { header: "subCategory", value: (t) => t.name },
        { header: "slug", value: (t) => t.slug },
        { header: "href", value: (t) => t.href },
        { header: "metaTitle", value: (t) => t.metaTitle },
        { header: "metaDescription", value: (t) => t.metaDescription },
        { header: "metaKeywords", value: (t) => joinList(t.metaKeywords) },
      ],
    }),
  ];
}

// ─── Import cell coercion ─────────────────────────────────────────────────────

const cell = (row: Record<string, string>, key: string): string =>
  (row[key] ?? "").trim();

function intCell(row: Record<string, string>, key: string): number | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error(`${key}: "${v}" is not an integer`);
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

export function mapServiceCategoryDataRow(
  row: Record<string, string>,
): ServiceCategoryUpsertRow {
  return {
    id: intCell(row, "id"),
    isActive: boolCell(row, "isActive"),
    sortOrder: intCell(row, "sortOrder"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}

export function mapServiceCategoryTranslationRow(
  row: Record<string, string>,
): ServiceCategoryTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    serviceCategoryId: intCell(row, "serviceCategoryId"),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    category: stringCell(row, "category"),
    slug: stringCell(row, "slug"),
    href: stringCell(row, "href"),
    metaTitle: stringCell(row, "metaTitle"),
    metaDescription: stringCell(row, "metaDescription"),
    metaKeywords: listCell(row, "metaKeywords"),
  };
}

export function mapServiceSubCategoryDataRow(
  row: Record<string, string>,
): ServiceSubCategoryUpsertRow {
  return {
    id: intCell(row, "id"),
    serviceCategoryId: intCell(row, "serviceCategoryId"),
    isActive: boolCell(row, "isActive"),
    sortOrder: intCell(row, "sortOrder"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}

export function mapServiceSubCategoryTranslationRow(
  row: Record<string, string>,
): ServiceSubCategoryTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    serviceSubCategoryId: intCell(row, "serviceSubCategoryId"),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    subCategory: stringCell(row, "subCategory"),
    slug: stringCell(row, "slug"),
    href: stringCell(row, "href"),
    metaTitle: stringCell(row, "metaTitle"),
    metaDescription: stringCell(row, "metaDescription"),
    metaKeywords: listCell(row, "metaKeywords"),
  };
}
