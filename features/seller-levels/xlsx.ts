import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import type { Language } from "@/types/enums";
import type { SellerLevel } from "@/types/account";

/**
 * XLSX round-trip for seller levels.
 *
 * Two tabs — `data` (base level rows) and `translations`. `benefits` is stored
 * as JSON text so it survives the round-trip; on import it is parsed server-side
 * (an invalid JSON cell fails just that row). Rows with an `id` update; rows
 * without an `id` create. Empty cells leave the current value unchanged.
 */

const LANGUAGES: Language[] = ["ES", "EN", "FR", "PT", "DE"];

export type SellerLevelUpsertRow = {
  id?: number;
  levelName?: string;
  minPoints?: number;
  maxPoints?: number | null;
  benefits?: string | null;
  badgeIcon?: string | null;
};

export type SellerLevelTranslationUpsertRow = {
  id?: number;
  sellerLevelId?: number;
  language?: Language;
  levelName?: string;
};

const benefitsToText = (benefits: unknown): string => {
  if (benefits == null) return "";
  return typeof benefits === "string" ? benefits : JSON.stringify(benefits);
};

// ─── Export ───────────────────────────────────────────────────────────────────

export function buildSellerLevelSheets(rows: SellerLevel[]): BuiltSheet[] {
  return [
    buildSheet({
      name: "data",
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "levelName", value: (r) => r.levelName },
        { header: "minPoints", value: (r) => r.minPoints },
        { header: "maxPoints", value: (r) => r.maxPoints ?? "" },
        { header: "benefits", value: (r) => benefitsToText(r.benefits) },
        { header: "badgeIcon", value: (r) => r.badgeIcon ?? "" },
      ],
    }),
    buildSheet({
      name: "translations",
      rows: rows.flatMap((r) => r.translations ?? []),
      columns: [
        { header: "id", value: (t) => t.id },
        { header: "sellerLevelId", value: (t) => t.sellerLevelId },
        { header: "language", value: (t) => t.language },
        { header: "levelName", value: (t) => t.levelName },
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

export function mapSellerLevelDataRow(row: Record<string, string>): SellerLevelUpsertRow {
  return {
    id: intCell(row, "id"),
    levelName: stringCell(row, "levelName"),
    minPoints: intCell(row, "minPoints"),
    maxPoints: intCell(row, "maxPoints"),
    // Sent as JSON text; parsed and validated server-side.
    benefits: stringCell(row, "benefits"),
    badgeIcon: stringCell(row, "badgeIcon"),
  };
}

export function mapSellerLevelTranslationRow(
  row: Record<string, string>,
): SellerLevelTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    sellerLevelId: intCell(row, "sellerLevelId"),
    language: enumCell<Language>(row, "language", LANGUAGES),
    levelName: stringCell(row, "levelName"),
  };
}
