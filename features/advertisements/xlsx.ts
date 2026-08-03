import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import {
  ADVERTISEMENT_TYPES,
  type AdvertisementType,
  type AdvertisementUpsertRow,
  type RawAdvertisement,
} from "./types";

/**
 * XLSX round-trip for advertisements — a single `data` sheet. Date cells accept
 * ISO or YYYY-MM-DD. Timestamps are export-only reference columns. Rows with an
 * id update; rows without an id create.
 */
export const DATA_SHEET = "data";

export function buildAdvertisementSheets(rows: RawAdvertisement[]): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "adType", value: (r) => r.adType },
        { header: "price", value: (r) => r.price },
        { header: "content", value: (r) => r.content },
        { header: "startDate", value: (r) => r.startDate },
        { header: "endDate", value: (r) => r.endDate },
        { header: "isActive", value: (r) => r.isActive },
        { header: "sellerId", value: (r) => r.sellerId },
        { header: "productId", value: (r) => r.productId },
        { header: "storeProductId", value: (r) => r.storeProductId },
        { header: "serviceId", value: (r) => r.serviceId },
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

function stringCell(row: Record<string, string>, key: string): string | undefined {
  const v = cell(row, key);
  return v === "" ? undefined : v;
}

function dateCell(row: Record<string, string>, key: string): string | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) throw new Error(`${key}: "${v}" is not a valid date`);
  return date.toISOString();
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

export function mapAdvertisementRow(row: Record<string, string>): AdvertisementUpsertRow {
  return {
    id: intCell(row, "id"),
    adType: enumCell<AdvertisementType>(row, "adType", ADVERTISEMENT_TYPES),
    price: intCell(row, "price"),
    content: stringCell(row, "content"),
    startDate: dateCell(row, "startDate"),
    endDate: dateCell(row, "endDate"),
    isActive: boolCell(row, "isActive"),
    sellerId: stringCell(row, "sellerId"),
    productId: intCell(row, "productId"),
    storeProductId: intCell(row, "storeProductId"),
    serviceId: intCell(row, "serviceId"),
  };
}
