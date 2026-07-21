import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import {
  CATALOG_LANGUAGES,
  type BlogCategoryTranslationUpsertRow,
  type BlogCategoryUpsertRow,
  type CatalogLanguage,
  type CommunityCategoryTranslationUpsertRow,
  type CommunityCategoryUpsertRow,
  type CommunitySubCategoryTranslationUpsertRow,
  type CommunitySubCategoryUpsertRow,
  type RawBlogCategory,
  type RawCommunityCategory,
  type RawCommunitySubCategory,
} from "./types";

/**
 * XLSX round-trip for the blog & community category tables.
 *
 * Every export produces one workbook with two tabs — `data` (base rows) and
 * `translations` — whose headers are the raw backend field names, so an edited
 * file can be re-imported as-is. Extra columns (`createdAt`, `name (read-only)`)
 * are export-only conveniences the import mappers ignore. The translation
 * name column keeps its per-table backend spelling (`name` / `category` /
 * `subCategory`). List cells are joined with " | " and split back on "|" or
 * newline.
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

export function buildBlogCategorySheets(rows: RawBlogCategory[]): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "name (read-only)", value: referenceName },
        { header: "icon", value: (r) => r.icon },
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
        { header: "blogCategoryId", value: (t) => t.blogCategoryId },
        { header: "language", value: (t) => t.language },
        { header: "name", value: (t) => t.name },
        { header: "slug", value: (t) => t.slug },
        { header: "description", value: (t) => t.description },
        { header: "href", value: (t) => t.href },
        { header: "metaTitle", value: (t) => t.metaTitle },
        { header: "metaDescription", value: (t) => t.metaDescription },
        { header: "metaKeywords", value: (t) => joinList(t.metaKeywords) },
      ],
    }),
  ];
}

export function buildCommunityCategorySheets(rows: RawCommunityCategory[]): BuiltSheet[] {
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
        { header: "communityCategoryId", value: (t) => t.communityCategoryId },
        { header: "language", value: (t) => t.language },
        { header: "category", value: (t) => t.name },
        { header: "slug", value: (t) => t.slug },
        { header: "description", value: (t) => t.description },
        { header: "href", value: (t) => t.href },
        { header: "metaTitle", value: (t) => t.metaTitle },
        { header: "metaDescription", value: (t) => t.metaDescription },
        { header: "metaKeywords", value: (t) => joinList(t.metaKeywords) },
      ],
    }),
  ];
}

export function buildCommunitySubCategorySheets(
  rows: RawCommunitySubCategory[],
): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "name (read-only)", value: referenceName },
        { header: "communityCategoryId", value: (r) => r.communityCategoryId },
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
          header: "communitySubCategoryId",
          value: (t) => t.communitySubCategoryId,
        },
        { header: "language", value: (t) => t.language },
        { header: "subCategory", value: (t) => t.name },
        { header: "slug", value: (t) => t.slug },
        { header: "description", value: (t) => t.description },
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

export function mapBlogCategoryDataRow(
  row: Record<string, string>,
): BlogCategoryUpsertRow {
  return {
    id: intCell(row, "id"),
    icon: stringCell(row, "icon"),
    isActive: boolCell(row, "isActive"),
    sortOrder: intCell(row, "sortOrder"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}

export function mapBlogCategoryTranslationRow(
  row: Record<string, string>,
): BlogCategoryTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    blogCategoryId: intCell(row, "blogCategoryId"),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    name: stringCell(row, "name"),
    slug: stringCell(row, "slug"),
    description: stringCell(row, "description"),
    href: stringCell(row, "href"),
    metaTitle: stringCell(row, "metaTitle"),
    metaDescription: stringCell(row, "metaDescription"),
    metaKeywords: listCell(row, "metaKeywords"),
  };
}

export function mapCommunityCategoryDataRow(
  row: Record<string, string>,
): CommunityCategoryUpsertRow {
  return {
    id: intCell(row, "id"),
    isActive: boolCell(row, "isActive"),
    sortOrder: intCell(row, "sortOrder"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}

export function mapCommunityCategoryTranslationRow(
  row: Record<string, string>,
): CommunityCategoryTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    communityCategoryId: intCell(row, "communityCategoryId"),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    category: stringCell(row, "category"),
    slug: stringCell(row, "slug"),
    description: stringCell(row, "description"),
    href: stringCell(row, "href"),
    metaTitle: stringCell(row, "metaTitle"),
    metaDescription: stringCell(row, "metaDescription"),
    metaKeywords: listCell(row, "metaKeywords"),
  };
}

export function mapCommunitySubCategoryDataRow(
  row: Record<string, string>,
): CommunitySubCategoryUpsertRow {
  return {
    id: intCell(row, "id"),
    communityCategoryId: intCell(row, "communityCategoryId"),
    isActive: boolCell(row, "isActive"),
    sortOrder: intCell(row, "sortOrder"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}

export function mapCommunitySubCategoryTranslationRow(
  row: Record<string, string>,
): CommunitySubCategoryTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    communitySubCategoryId: intCell(row, "communitySubCategoryId"),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    subCategory: stringCell(row, "subCategory"),
    slug: stringCell(row, "slug"),
    description: stringCell(row, "description"),
    href: stringCell(row, "href"),
    metaTitle: stringCell(row, "metaTitle"),
    metaDescription: stringCell(row, "metaDescription"),
    metaKeywords: listCell(row, "metaKeywords"),
  };
}
