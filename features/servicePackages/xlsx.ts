import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import type {
  RawServicePackage,
  ServicePackageItemUpsertRow,
  ServicePackageUpsertRow,
} from "./types";

/**
 * XLSX round-trip for service packages. Two tabs — `packages` (base rows) and
 * `items`. Timestamps are export-only reference columns. Rows with an id update;
 * rows without an id create (items match on packageId+serviceId).
 */
export const PACKAGES_SHEET = "packages";
export const ITEMS_SHEET = "items";

export function buildServicePackageSheets(rows: RawServicePackage[]): BuiltSheet[] {
  return [
    buildSheet({
      name: PACKAGES_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "sellerId", value: (r) => r.sellerId },
        { header: "name", value: (r) => r.name },
        { header: "description", value: (r) => r.description },
        { header: "totalPrice", value: (r) => r.totalPrice },
        { header: "discountPercentage", value: (r) => r.discountPercentage },
        { header: "validityDays", value: (r) => r.validityDays },
        { header: "isActive", value: (r) => r.isActive },
        { header: "createdAt", value: (r) => r.createdAt },
        { header: "updatedAt", value: (r) => r.updatedAt },
      ],
    }),
    buildSheet({
      name: ITEMS_SHEET,
      rows: rows.flatMap((r) => r.servicePackageItem ?? []),
      columns: [
        { header: "id", value: (i) => i.id },
        { header: "packageId", value: (i) => i.packageId },
        { header: "serviceId", value: (i) => i.serviceId },
        { header: "quantity", value: (i) => i.quantity },
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

function stringCell(row: Record<string, string>, key: string): string | undefined {
  const v = cell(row, key);
  return v === "" ? undefined : v;
}

// ─── Import row mappers ───────────────────────────────────────────────────────

export function mapServicePackageRow(
  row: Record<string, string>,
): ServicePackageUpsertRow {
  return {
    id: intCell(row, "id"),
    sellerId: stringCell(row, "sellerId"),
    name: stringCell(row, "name"),
    description: stringCell(row, "description"),
    totalPrice: floatCell(row, "totalPrice"),
    discountPercentage: floatCell(row, "discountPercentage"),
    validityDays: intCell(row, "validityDays"),
    isActive: boolCell(row, "isActive"),
  };
}

export function mapServicePackageItemRow(
  row: Record<string, string>,
): ServicePackageItemUpsertRow {
  return {
    id: intCell(row, "id"),
    packageId: intCell(row, "packageId"),
    serviceId: intCell(row, "serviceId"),
    quantity: intCell(row, "quantity"),
  };
}
