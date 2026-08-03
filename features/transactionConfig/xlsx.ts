import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import { KIND_CONFIG, type TxConfigKind, type TxRow, type TxUpsertRow } from "./types";

/**
 * XLSX round-trip for a transaction-config table — a single `data` sheet.
 * Headers are the raw backend field names so an edited file re-imports as-is;
 * id (+ createdAt/updatedAt when present) are export-only reference columns the
 * mapper ignores, except id which drives update-vs-create.
 */
export const DATA_SHEET = "data";

export function buildTransactionConfigSheets(
  kind: TxConfigKind,
  rows: TxRow[],
): BuiltSheet[] {
  const cfg = KIND_CONFIG[kind];
  return [
    buildSheet({
      name: DATA_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id as string | number },
        ...cfg.fields.map((f) => ({
          header: f.key,
          value: (r: TxRow) => r[f.key] as string | number | boolean | null,
        })),
        ...(cfg.hasTimestamps
          ? [
              { header: "createdAt", value: (r: TxRow) => r.createdAt ?? null },
              { header: "updatedAt", value: (r: TxRow) => r.updatedAt ?? null },
            ]
          : []),
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

function enumCell(
  row: Record<string, string>,
  key: string,
  options: readonly string[],
): string | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  const match = options.find((o) => o.toLowerCase() === v.toLowerCase());
  if (!match) throw new Error(`${key}: "${v}" is not one of ${options.join(", ")}`);
  return match;
}

/** Builds an upsert row from a spreadsheet row, coercing each column by type. */
export function mapTransactionConfigRow(kind: TxConfigKind) {
  const cfg = KIND_CONFIG[kind];
  return (row: Record<string, string>): TxUpsertRow => {
    const idRaw = cell(row, "id");
    const out: TxUpsertRow = {
      id: idRaw === "" ? undefined : cfg.coerceId(idRaw),
    };
    for (const f of cfg.fields) {
      out[f.key] =
        f.type === "int"
          ? intCell(row, f.key)
          : f.type === "float"
            ? floatCell(row, f.key)
            : f.type === "enum"
              ? enumCell(row, f.key, f.options ?? [])
              : stringCell(row, f.key);
    }
    return out;
  };
}
