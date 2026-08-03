import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import {
  PAYMENT_ENVIRONMENTS,
  PAYMENT_PROVIDERS,
  type ChileanPaymentProvider,
  type PaymentConfigUpsertRow,
  type PaymentEnvironment,
  type RawPaymentConfig,
} from "./types";

/**
 * XLSX round-trip for payment configs — a single `data` sheet. apiKey/secretKey
 * are NOT exported (write-only); to set them, add `apiKey`/`secretKey` columns
 * to the sheet before importing. Timestamps are export-only reference columns.
 */
export const DATA_SHEET = "data";

export function buildPaymentConfigSheets(rows: RawPaymentConfig[]): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "sellerId", value: (r) => r.sellerId },
        { header: "provider", value: (r) => r.provider },
        { header: "merchantId", value: (r) => r.merchantId },
        { header: "environment", value: (r) => r.environment },
        { header: "isActive", value: (r) => r.isActive },
        { header: "webhookUrl", value: (r) => r.webhookUrl },
        { header: "returnUrl", value: (r) => r.returnUrl },
        { header: "cancelUrl", value: (r) => r.cancelUrl },
        { header: "createdAt", value: (r) => r.createdAt },
        { header: "updatedAt", value: (r) => r.updatedAt },
      ],
    }),
  ];
}

// ─── Import cell coercion ─────────────────────────────────────────────────────

const cell = (row: Record<string, string>, key: string): string =>
  (row[key] ?? "").trim();

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

export function mapPaymentConfigRow(row: Record<string, string>): PaymentConfigUpsertRow {
  return {
    id: stringCell(row, "id"),
    sellerId: stringCell(row, "sellerId"),
    provider: enumCell<ChileanPaymentProvider>(row, "provider", PAYMENT_PROVIDERS),
    merchantId: stringCell(row, "merchantId"),
    apiKey: stringCell(row, "apiKey"),
    secretKey: stringCell(row, "secretKey"),
    environment: enumCell<PaymentEnvironment>(row, "environment", PAYMENT_ENVIRONMENTS),
    isActive: boolCell(row, "isActive"),
    webhookUrl: stringCell(row, "webhookUrl"),
    returnUrl: stringCell(row, "returnUrl"),
    cancelUrl: stringCell(row, "cancelUrl"),
  };
}
