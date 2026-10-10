import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import type { Language, TransactionKind } from "@/types/enums";
import type { SellerLabel } from "@/types/account";

/**
 * XLSX round-trip for seller labels.
 *
 * The workbook has two tabs — `data` (base label rows) and `translations` —
 * whose headers are the raw backend field names, so an edited file re-imports
 * as-is. Rows with an `id` update; rows without an `id` create. Empty cells
 * leave the current value unchanged.
 */

export const TRANSACTION_KINDS: TransactionKind[] = [
  "PURCHASE",
  "SELL",
  "STOREPURCHASE",
  "EXCHANGE",
  "RECYCLE",
  "REPAIR",
  "ATTENDTOWORKSHOP",
  "ATTENDTOEVENT",
  "REGISTRATION",
  "BONUS",
  "SERVICE",
  "PROVIDESERVICE",
  "ORGANIZEEVENT",
];

const LANGUAGES: Language[] = ["ES", "EN", "FR", "PT", "DE"];

export type SellerLabelUpsertRow = {
  id?: number;
  labelName?: string;
  transactionKind?: TransactionKind;
  transactionsRequired?: number;
  description?: string | null;
  badgeIcon?: string | null;
};

export type SellerLabelTranslationUpsertRow = {
  id?: number;
  sellerLabelId?: number;
  language?: Language;
  labelName?: string;
  description?: string | null;
};

// ─── Export ───────────────────────────────────────────────────────────────────

export function buildSellerLabelSheets(rows: SellerLabel[]): BuiltSheet[] {
  return [
    buildSheet({
      name: "data",
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "labelName", value: (r) => r.labelName },
        { header: "transactionKind", value: (r) => r.transactionKind },
        { header: "transactionsRequired", value: (r) => r.transactionsRequired },
        { header: "description", value: (r) => r.description ?? "" },
        { header: "badgeIcon", value: (r) => r.badgeIcon ?? "" },
      ],
    }),
    buildSheet({
      name: "translations",
      rows: rows.flatMap((r) => r.translations ?? []),
      columns: [
        { header: "id", value: (t) => t.id },
        { header: "sellerLabelId", value: (t) => t.sellerLabelId },
        { header: "language", value: (t) => t.language },
        { header: "labelName", value: (t) => t.labelName },
        { header: "description", value: (t) => t.description ?? "" },
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

export function mapSellerLabelDataRow(row: Record<string, string>): SellerLabelUpsertRow {
  return {
    id: intCell(row, "id"),
    labelName: stringCell(row, "labelName"),
    transactionKind: enumCell<TransactionKind>(row, "transactionKind", TRANSACTION_KINDS),
    transactionsRequired: intCell(row, "transactionsRequired"),
    description: stringCell(row, "description"),
    badgeIcon: stringCell(row, "badgeIcon"),
  };
}

export function mapSellerLabelTranslationRow(
  row: Record<string, string>,
): SellerLabelTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    sellerLabelId: intCell(row, "sellerLabelId"),
    language: enumCell<Language>(row, "language", LANGUAGES),
    labelName: stringCell(row, "labelName"),
    description: stringCell(row, "description"),
  };
}
