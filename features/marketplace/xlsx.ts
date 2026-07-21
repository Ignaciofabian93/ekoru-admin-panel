import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import {
  CATALOG_LANGUAGES,
  PRODUCT_SIZES,
  WEIGHT_UNITS,
  type CatalogLanguage,
  type DepartmentCategoryTranslationUpsertRow,
  type DepartmentCategoryUpsertRow,
  type DepartmentTranslationUpsertRow,
  type DepartmentUpsertRow,
  type ProductCategoryTranslationUpsertRow,
  type ProductCategoryUpsertRow,
  type ProductSize,
  type RawDepartment,
  type RawDepartmentCategory,
  type RawProductCategory,
  type WeightUnit,
} from "./types";

/**
 * XLSX round-trip for the marketplace catalog tables.
 *
 * Every export produces one workbook with two tabs — `data` (base rows) and
 * `translations` — whose headers are the raw backend field names, so an edited
 * file can be re-imported as-is. Extra columns (`createdAt`, `name (read-only)`)
 * are export-only conveniences the import mappers ignore. List cells (keywords)
 * are joined with " | " and split back on "|" or newline.
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

export function buildDepartmentSheets(rows: RawDepartment[]): BuiltSheet[] {
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
        { header: "departmentId", value: (t) => t.departmentId },
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

export function buildDepartmentCategorySheets(
  rows: RawDepartmentCategory[],
): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "name (read-only)", value: referenceName },
        { header: "departmentId", value: (r) => r.departmentId },
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
        { header: "departmentCategoryId", value: (t) => t.departmentCategoryId },
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

export function buildProductCategorySheets(rows: RawProductCategory[]): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "name (read-only)", value: referenceName },
        { header: "departmentCategoryId", value: (r) => r.departmentCategoryId },
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
        { header: "productCategoryId", value: (t) => t.productCategoryId },
        { header: "language", value: (t) => t.language },
        { header: "name", value: (t) => t.name },
        { header: "slug", value: (t) => t.slug },
        { header: "keywords", value: (t) => joinList(t.keywords) },
        { header: "href", value: (t) => t.href },
        { header: "metaTitle", value: (t) => t.metaTitle },
        { header: "metaDescription", value: (t) => t.metaDescription },
        { header: "metaKeywords", value: (t) => joinList(t.metaKeywords) },
      ],
    }),
  ];
}

// ─── Import cell coercion ─────────────────────────────────────────────────────
// Empty cells mean "leave unchanged" and map to undefined; malformed values
// throw with a message that names the column so the dialog can report the
// exact spreadsheet line.

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

export function mapDepartmentDataRow(row: Record<string, string>): DepartmentUpsertRow {
  return {
    id: intCell(row, "id"),
    isActive: boolCell(row, "isActive"),
    sortOrder: intCell(row, "sortOrder"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}

export function mapDepartmentTranslationRow(
  row: Record<string, string>,
): DepartmentTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    departmentId: intCell(row, "departmentId"),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    name: stringCell(row, "name"),
    slug: stringCell(row, "slug"),
    href: stringCell(row, "href"),
    metaTitle: stringCell(row, "metaTitle"),
    metaDescription: stringCell(row, "metaDescription"),
    metaKeywords: listCell(row, "metaKeywords"),
  };
}

export function mapDepartmentCategoryDataRow(
  row: Record<string, string>,
): DepartmentCategoryUpsertRow {
  return {
    id: intCell(row, "id"),
    departmentId: intCell(row, "departmentId"),
    isActive: boolCell(row, "isActive"),
    sortOrder: intCell(row, "sortOrder"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}

export function mapDepartmentCategoryTranslationRow(
  row: Record<string, string>,
): DepartmentCategoryTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    departmentCategoryId: intCell(row, "departmentCategoryId"),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    name: stringCell(row, "name"),
    slug: stringCell(row, "slug"),
    href: stringCell(row, "href"),
    metaTitle: stringCell(row, "metaTitle"),
    metaDescription: stringCell(row, "metaDescription"),
    metaKeywords: listCell(row, "metaKeywords"),
  };
}

export function mapProductCategoryDataRow(
  row: Record<string, string>,
): ProductCategoryUpsertRow {
  return {
    id: intCell(row, "id"),
    departmentCategoryId: intCell(row, "departmentCategoryId"),
    averageWeight: floatCell(row, "averageWeight"),
    size: enumCell<ProductSize>(row, "size", PRODUCT_SIZES),
    weightUnit: enumCell<WeightUnit>(row, "weightUnit", WEIGHT_UNITS),
    isActive: boolCell(row, "isActive"),
    sortOrder: intCell(row, "sortOrder"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}

export function mapProductCategoryTranslationRow(
  row: Record<string, string>,
): ProductCategoryTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    productCategoryId: intCell(row, "productCategoryId"),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    name: stringCell(row, "name"),
    slug: stringCell(row, "slug"),
    keywords: listCell(row, "keywords"),
    href: stringCell(row, "href"),
    metaTitle: stringCell(row, "metaTitle"),
    metaDescription: stringCell(row, "metaDescription"),
    metaKeywords: listCell(row, "metaKeywords"),
  };
}
