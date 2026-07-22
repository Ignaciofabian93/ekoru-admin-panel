import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import {
  CATALOG_LANGUAGES,
  messageParentKey,
  type CatalogLanguage,
  type ImpactMessageKind,
  type ImpactMessageTranslationUpsertRow,
  type ImpactMessageUpsertRow,
  type MaterialImpactTranslationUpsertRow,
  type MaterialImpactUpsertRow,
  type RawImpactMessage,
  type RawMaterialImpact,
} from "./types";

/**
 * XLSX round-trip for the marketplace impact tables. Each export is one
 * workbook with a `data` tab (base rows) and a `translations` tab, headers are
 * the raw backend field names so an edited file re-imports as-is. `createdAt` /
 * `updatedAt` are export-only and ignored on import.
 */

export const DATA_SHEET = "data";
export const TRANSLATIONS_SHEET = "translations";

// ─── Export builders ─────────────────────────────────────────────────────────

export function buildMaterialImpactSheets(rows: RawMaterialImpact[]): BuiltSheet[] {
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "materialType", value: (r) => r.materialType },
        { header: "estimatedCo2SavingsKG", value: (r) => r.estimatedCo2SavingsKG },
        {
          header: "estimatedWaterSavingsLT",
          value: (r) => r.estimatedWaterSavingsLT,
        },
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
          header: "materialImpactEstimateId",
          value: (t) => t.materialImpactEstimateId,
        },
        { header: "language", value: (t) => t.language },
        {
          header: "materialTypeTranslation",
          value: (t) => t.materialTypeTranslation,
        },
      ],
    }),
  ];
}

export function buildImpactMessageSheets(
  kind: ImpactMessageKind,
  rows: RawImpactMessage[],
): BuiltSheet[] {
  const parentKey = messageParentKey(kind);
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "min", value: (r) => r.min },
        { header: "max", value: (r) => r.max },
        { header: "message1", value: (r) => r.message1 },
        { header: "message2", value: (r) => r.message2 },
        { header: "message3", value: (r) => r.message3 },
        { header: "createdAt", value: (r) => r.createdAt },
        { header: "updatedAt", value: (r) => r.updatedAt },
      ],
    }),
    buildSheet({
      name: TRANSLATIONS_SHEET,
      rows: rows.flatMap((r) => r.translations),
      columns: [
        { header: "id", value: (t) => t.id },
        { header: parentKey, value: (t) => t.parentId },
        { header: "language", value: (t) => t.language },
        { header: "message1", value: (t) => t.message1 },
        { header: "message2", value: (t) => t.message2 },
        { header: "message3", value: (t) => t.message3 },
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

export function mapMaterialImpactDataRow(
  row: Record<string, string>,
): MaterialImpactUpsertRow {
  return {
    id: intCell(row, "id"),
    materialType: stringCell(row, "materialType"),
    estimatedCo2SavingsKG: floatCell(row, "estimatedCo2SavingsKG"),
    estimatedWaterSavingsLT: floatCell(row, "estimatedWaterSavingsLT"),
  };
}

export function mapMaterialImpactTranslationRow(
  row: Record<string, string>,
): MaterialImpactTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    materialImpactEstimateId: intCell(row, "materialImpactEstimateId"),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    materialTypeTranslation: stringCell(row, "materialTypeTranslation"),
  };
}

export function mapImpactMessageDataRow(
  row: Record<string, string>,
): ImpactMessageUpsertRow {
  return {
    id: intCell(row, "id"),
    min: floatCell(row, "min"),
    max: floatCell(row, "max"),
    message1: stringCell(row, "message1"),
    message2: stringCell(row, "message2"),
    message3: stringCell(row, "message3"),
  };
}

export function mapImpactMessageTranslationRow(
  kind: ImpactMessageKind,
  row: Record<string, string>,
): ImpactMessageTranslationUpsertRow {
  const parentKey = messageParentKey(kind);
  return {
    id: intCell(row, "id"),
    [parentKey]: intCell(row, parentKey),
    language: enumCell<CatalogLanguage>(row, "language", CATALOG_LANGUAGES),
    message1: stringCell(row, "message1"),
    message2: stringCell(row, "message2"),
    message3: stringCell(row, "message3"),
  };
}
