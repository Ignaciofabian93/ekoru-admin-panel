import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import {
  BADGES,
  PRODUCT_CONDITIONS,
  type Badge,
  type ProductCondition,
  type ProductUpsertRow,
  type RawProduct,
} from "./types";

/**
 * XLSX round-trip for the marketplace Product table — a single `data` sheet
 * (no translations). Headers are the raw backend field names so an edited file
 * re-imports as-is. Metrics, timestamps and `deletedAt` are export-only
 * reference columns the import mapper ignores. List cells (images/badges/
 * interests) join with " | " and split back on "|" or newline.
 */

export const DATA_SHEET = "data";

const joinList = (values: string[] | null | undefined) => (values ?? []).join(" | ");

export function buildProductSheets(rows: RawProduct[]): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "name", value: (r) => r.name },
        { header: "description", value: (r) => r.description },
        { header: "sellerId", value: (r) => r.sellerId },
        { header: "productCategoryId", value: (r) => r.productCategoryId },
        { header: "brand", value: (r) => r.brand },
        { header: "price", value: (r) => r.price },
        { header: "condition", value: (r) => r.condition },
        { header: "conditionDescription", value: (r) => r.conditionDescription },
        { header: "color", value: (r) => r.color },
        { header: "isActive", value: (r) => r.isActive },
        { header: "isExchangeable", value: (r) => r.isExchangeable },
        { header: "badges", value: (r) => joinList(r.badges) },
        { header: "interests", value: (r) => joinList(r.interests) },
        { header: "images", value: (r) => joinList(r.images) },
        { header: "featuredFrom", value: (r) => r.featuredFrom },
        { header: "featuredUntil", value: (r) => r.featuredUntil },
        // Reference columns (export-only, ignored on import):
        { header: "likesCount (read-only)", value: (r) => r.likesCount },
        { header: "viewCount (read-only)", value: (r) => r.viewCount },
        { header: "deletedAt (read-only)", value: (r) => r.deletedAt },
        { header: "createdAt", value: (r) => r.createdAt },
        { header: "updatedAt", value: (r) => r.updatedAt },
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

function badgeListCell(row: Record<string, string>, key: string): Badge[] | undefined {
  const list = listCell(row, key);
  if (list === undefined) return undefined;
  return list.map((raw) => {
    const b = raw.toUpperCase();
    if (!BADGES.includes(b as Badge))
      throw new Error(`${key}: "${raw}" is not a valid badge`);
    return b as Badge;
  });
}

// ─── Import row mapper ────────────────────────────────────────────────────────

export function mapProductRow(row: Record<string, string>): ProductUpsertRow {
  return {
    id: intCell(row, "id"),
    name: stringCell(row, "name"),
    description: stringCell(row, "description"),
    sellerId: stringCell(row, "sellerId"),
    productCategoryId: intCell(row, "productCategoryId"),
    brand: stringCell(row, "brand"),
    price: intCell(row, "price"),
    condition: enumCell<ProductCondition>(row, "condition", PRODUCT_CONDITIONS),
    conditionDescription: stringCell(row, "conditionDescription"),
    color: stringCell(row, "color"),
    isActive: boolCell(row, "isActive"),
    isExchangeable: boolCell(row, "isExchangeable"),
    badges: badgeListCell(row, "badges"),
    interests: listCell(row, "interests"),
    images: listCell(row, "images"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}
