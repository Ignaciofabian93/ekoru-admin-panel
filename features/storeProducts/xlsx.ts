import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import {
  BADGES,
  DIMENSION_UNITS,
  WEIGHT_UNITS,
  type Badge,
  type DimensionUnit,
  type RawStoreProduct,
  type StoreProductUpsertRow,
  type WeightUnit,
} from "./types";

/**
 * XLSX round-trip for StoreProduct — a single `data` sheet (the table has no
 * translations). Headers are the raw backend field names so an edited file
 * re-imports as-is. Metrics, timestamps and `deletedAt` are export-only
 * reference columns the import mapper ignores. List cells (images/tags/
 * features/badges) join with " | " and split back on "|" or newline.
 */

export const DATA_SHEET = "data";

const joinList = (values: string[] | null | undefined) => (values ?? []).join(" | ");

export function buildStoreProductSheets(rows: RawStoreProduct[]): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "name", value: (r) => r.name },
        { header: "description", value: (r) => r.description },
        { header: "sellerId", value: (r) => r.sellerId },
        { header: "subCategoryId", value: (r) => r.subCategoryId },
        { header: "price", value: (r) => r.price },
        { header: "stock", value: (r) => r.stock },
        { header: "hasOffer", value: (r) => r.hasOffer },
        { header: "offerPrice", value: (r) => r.offerPrice },
        { header: "sku", value: (r) => r.sku },
        { header: "barcode", value: (r) => r.barcode },
        { header: "isActive", value: (r) => r.isActive },
        { header: "badges", value: (r) => joinList(r.badges) },
        { header: "brand", value: (r) => r.brand },
        { header: "color", value: (r) => r.color },
        { header: "images", value: (r) => joinList(r.images) },
        { header: "materialComposition", value: (r) => r.materialComposition },
        { header: "recycledContent", value: (r) => r.recycledContent },
        { header: "weight", value: (r) => r.weight },
        { header: "weightUnit", value: (r) => r.weightUnit },
        { header: "length", value: (r) => r.length },
        { header: "width", value: (r) => r.width },
        { header: "height", value: (r) => r.height },
        { header: "dimensionUnit", value: (r) => r.dimensionUnit },
        { header: "lowStockThreshold", value: (r) => r.lowStockThreshold },
        { header: "isLowStock", value: (r) => r.isLowStock },
        { header: "tags", value: (r) => joinList(r.tags) },
        { header: "metaTitle", value: (r) => r.metaTitle },
        { header: "metaDescription", value: (r) => r.metaDescription },
        { header: "warranty", value: (r) => r.warranty },
        { header: "warrantyDuration", value: (r) => r.warrantyDuration },
        { header: "features", value: (r) => joinList(r.features) },
        { header: "featuredFrom", value: (r) => r.featuredFrom },
        { header: "featuredUntil", value: (r) => r.featuredUntil },
        // Reference columns (export-only, ignored on import):
        { header: "likesCount (read-only)", value: (r) => r.likesCount },
        { header: "saleCount (read-only)", value: (r) => r.saleCount },
        { header: "viewCount (read-only)", value: (r) => r.viewCount },
        { header: "averageRating (read-only)", value: (r) => r.averageRating },
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

export function mapStoreProductRow(row: Record<string, string>): StoreProductUpsertRow {
  return {
    id: intCell(row, "id"),
    name: stringCell(row, "name"),
    description: stringCell(row, "description"),
    sellerId: stringCell(row, "sellerId"),
    subCategoryId: intCell(row, "subCategoryId"),
    price: intCell(row, "price"),
    stock: intCell(row, "stock"),
    hasOffer: boolCell(row, "hasOffer"),
    offerPrice: intCell(row, "offerPrice"),
    sku: stringCell(row, "sku"),
    barcode: stringCell(row, "barcode"),
    isActive: boolCell(row, "isActive"),
    badges: badgeListCell(row, "badges"),
    brand: stringCell(row, "brand"),
    color: stringCell(row, "color"),
    images: listCell(row, "images"),
    materialComposition: stringCell(row, "materialComposition"),
    recycledContent: floatCell(row, "recycledContent"),
    weight: floatCell(row, "weight"),
    weightUnit: enumCell<WeightUnit>(row, "weightUnit", WEIGHT_UNITS),
    length: floatCell(row, "length"),
    width: floatCell(row, "width"),
    height: floatCell(row, "height"),
    dimensionUnit: enumCell<DimensionUnit>(row, "dimensionUnit", DIMENSION_UNITS),
    lowStockThreshold: intCell(row, "lowStockThreshold"),
    isLowStock: boolCell(row, "isLowStock"),
    tags: listCell(row, "tags"),
    metaTitle: stringCell(row, "metaTitle"),
    metaDescription: stringCell(row, "metaDescription"),
    warranty: boolCell(row, "warranty"),
    warrantyDuration: intCell(row, "warrantyDuration"),
    features: listCell(row, "features"),
    featuredFrom: dateCell(row, "featuredFrom"),
    featuredUntil: dateCell(row, "featuredUntil"),
  };
}
