import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import {
  KIND_CONFIG,
  type SearchKind,
  type SearchRow,
  type SearchUpsertRow,
} from "./types";

/**
 * XLSX round-trip for a search-config table — a single `data` sheet (no
 * translations). Headers are the raw backend field names so an edited file
 * re-imports as-is; id/createdAt/updatedAt are export-only reference columns the
 * mapper ignores (except id, which drives update-vs-create).
 */
export const DATA_SHEET = "data";

export function buildSearchConfigSheets(
  kind: SearchKind,
  rows: SearchRow[],
): BuiltSheet[] {
  const cfg = KIND_CONFIG[kind];
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        ...cfg.fields.map((f) => ({
          header: f.key,
          value: (r: SearchRow) => r[f.key] as string | number | boolean | null,
        })),
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

/** Builds an upsert row from a spreadsheet row, coercing each column by type. */
export function mapSearchConfigRow(kind: SearchKind) {
  const cfg = KIND_CONFIG[kind];
  return (row: Record<string, string>): SearchUpsertRow => {
    const out: SearchUpsertRow = { id: intCell(row, "id") };
    for (const f of cfg.fields) {
      out[f.key] =
        f.type === "int"
          ? intCell(row, f.key)
          : f.type === "float"
            ? floatCell(row, f.key)
            : f.type === "bool"
              ? boolCell(row, f.key)
              : stringCell(row, f.key);
    }
    return out;
  };
}
