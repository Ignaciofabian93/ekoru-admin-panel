import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import { BACKEND_LANGUAGES, type BackendLanguage } from "@/utils/language";
import {
  NOTIFICATION_TYPES,
  type NotificationTemplate,
  type NotificationTemplateTranslationUpsertRow,
  type NotificationTemplateUpsertRow,
} from "./types";

/**
 * XLSX round-trip for notification templates. Two tabs — `data` (base template
 * rows) and `translations`. Rows with an `id` update; rows without an `id`
 * create (templates match on the unique `type`, translations on
 * (notificationTemplateId, language)). Empty cells leave the value unchanged.
 */
export const DATA_SHEET = "data";
export const TRANSLATIONS_SHEET = "translations";

export function buildNotificationTemplateSheets(
  rows: NotificationTemplate[],
): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "type", value: (r) => r.type },
        { header: "title", value: (r) => r.title },
        { header: "message", value: (r) => r.message },
        { header: "isActive", value: (r) => (r.isActive ? "TRUE" : "FALSE") },
        { header: "createdAt", value: (r) => r.createdAt ?? "" },
        { header: "updatedAt", value: (r) => r.updatedAt ?? "" },
      ],
    }),
    buildSheet({
      name: TRANSLATIONS_SHEET,
      rows: rows.flatMap((r) => r.translations ?? []),
      columns: [
        { header: "id", value: (tr) => tr.id },
        { header: "notificationTemplateId", value: (tr) => tr.notificationTemplateId },
        { header: "language", value: (tr) => tr.language },
        { header: "title", value: (tr) => tr.title },
        { header: "message", value: (tr) => tr.message },
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

function boolCell(row: Record<string, string>, key: string): boolean | undefined {
  const v = cell(row, key).toLowerCase();
  if (v === "") return undefined;
  if (["true", "1", "yes", "si", "sí", "x"].includes(v)) return true;
  if (["false", "0", "no"].includes(v)) return false;
  throw new Error(`${key}: "${v}" is not a boolean (use TRUE/FALSE)`);
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

export function mapNotificationTemplateRow(
  row: Record<string, string>,
): NotificationTemplateUpsertRow {
  return {
    id: intCell(row, "id"),
    type: enumCell(row, "type", NOTIFICATION_TYPES),
    title: stringCell(row, "title"),
    message: stringCell(row, "message"),
    isActive: boolCell(row, "isActive"),
  };
}

export function mapNotificationTemplateTranslationRow(
  row: Record<string, string>,
): NotificationTemplateTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    notificationTemplateId: intCell(row, "notificationTemplateId"),
    language: enumCell<BackendLanguage>(row, "language", BACKEND_LANGUAGES),
    title: stringCell(row, "title"),
    message: stringCell(row, "message"),
  };
}
