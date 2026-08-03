import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import type { ProviderCredentialsUpsertRow, RawProviderCredentials } from "./types";

/**
 * XLSX round-trip for provider credentials — a single `data` sheet. Date cells
 * accept ISO or YYYY-MM-DD. Timestamps are export-only reference columns. Rows
 * with an id update; rows without an id create (matched on the unique sellerId).
 */
export const DATA_SHEET = "data";

export function buildProviderCredentialSheets(
  rows: RawProviderCredentials[],
): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "sellerId", value: (r) => r.sellerId },
        { header: "licenseNumber", value: (r) => r.licenseNumber },
        { header: "licenseType", value: (r) => r.licenseType },
        { header: "licenseExpiryDate", value: (r) => r.licenseExpiryDate },
        { header: "isLicenseVerified", value: (r) => r.isLicenseVerified },
        { header: "insuranceProvider", value: (r) => r.insuranceProvider },
        { header: "insurancePolicyNumber", value: (r) => r.insurancePolicyNumber },
        { header: "insuranceExpiryDate", value: (r) => r.insuranceExpiryDate },
        { header: "insuranceCoverage", value: (r) => r.insuranceCoverage },
        { header: "backgroundCheckDate", value: (r) => r.backgroundCheckDate },
        { header: "backgroundCheckStatus", value: (r) => r.backgroundCheckStatus },
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

export function mapProviderCredentialRow(
  row: Record<string, string>,
): ProviderCredentialsUpsertRow {
  return {
    id: intCell(row, "id"),
    sellerId: stringCell(row, "sellerId"),
    licenseNumber: stringCell(row, "licenseNumber"),
    licenseType: stringCell(row, "licenseType"),
    licenseExpiryDate: dateCell(row, "licenseExpiryDate"),
    isLicenseVerified: boolCell(row, "isLicenseVerified"),
    insuranceProvider: stringCell(row, "insuranceProvider"),
    insurancePolicyNumber: stringCell(row, "insurancePolicyNumber"),
    insuranceExpiryDate: dateCell(row, "insuranceExpiryDate"),
    insuranceCoverage: floatCell(row, "insuranceCoverage"),
    backgroundCheckDate: dateCell(row, "backgroundCheckDate"),
    backgroundCheckStatus: stringCell(row, "backgroundCheckStatus"),
  };
}
