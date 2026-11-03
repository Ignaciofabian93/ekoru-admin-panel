/**
 * Reading the cells of a business's publishing spreadsheet (ADM-16). Pure and
 * import-free: people type these cells by hand in Excel or Google Sheets, so
 * every rule about what a cell may hold lives here, and the server checks the
 * row again with the web's rules.
 */

export type FieldType =
  | "text"
  | "int"
  | "number"
  | "bool"
  | "list"
  | "enum"
  | "enumList"
  | "materials";

export type ColumnSpec = {
  key: string;
  type: FieldType;
  /** Needed to create a row (one without an id). */
  required?: boolean;
  /** Allowed codes for enum columns. */
  values?: readonly string[];
};

export type CellErrorCode =
  | "required"
  | "integer"
  | "number"
  | "bool"
  | "enum"
  | "material"
  | "materialFormat";

export type CellError = { code: CellErrorCode; key: string; value?: string };

export type MaterialRef = { id: number; materialType: string; label: string };

export type MaterialShare = { materialTypeId: number; percentage: number };

/** Header text without case, accents, spaces or punctuation. */
export function normalizeHeader(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * A number as people type it: "12000", "12.000" or "12,000" (thousands),
 * "1,5" or "1.5" (decimals), with or without "$" and spaces. Null when it is
 * not a number.
 */
export function parseNumber(raw: string): number | null {
  let text = raw.replace(/[$\s]/g, "");
  if (!text) return null;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(text)) {
    // 12.000 or 1.234,5 (Chilean style)
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(text)) {
    // 12,000 or 1,234.5
    text = text.replace(/,/g, "");
  } else {
    text = text.replace(",", ".");
  }
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

const YES = new Set([
  "si",
  "s",
  "yes",
  "y",
  "oui",
  "o",
  "true",
  "verdadero",
  "vrai",
  "1",
  "x",
]);
const NO = new Set(["no", "n", "non", "false", "falso", "faux", "0"]);

/** Yes or no in Spanish, English or French. Null when it is neither. */
export function parseBool(raw: string): boolean | null {
  const text = normalizeHeader(raw);
  if (YES.has(text)) return true;
  if (NO.has(text)) return false;
  return null;
}

/** Values separated by | (or line breaks), trimmed, empties dropped. */
export function splitList(raw: string): string[] {
  return raw
    .split(/[|\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * "WOOD:70 | METAL:30" → material ids and percentages. A material is named by
 * its code, its name or its id. A single material may go without a share: it
 * is then 100%.
 */
export function parseMaterials(
  raw: string,
  refs: MaterialRef[],
): { value: MaterialShare[] } | { error: CellError } {
  const byKey = new Map<string, MaterialRef>();
  for (const ref of refs) {
    byKey.set(normalizeHeader(ref.materialType), ref);
    byKey.set(normalizeHeader(ref.label), ref);
    byKey.set(String(ref.id), ref);
  }
  const parts = splitList(raw);
  const shares: MaterialShare[] = [];
  for (const part of parts) {
    const match = /^(.+?)\s*(?:[:=]\s*([\d.,]+)\s*%?)?$/.exec(part);
    if (!match) return { error: { code: "materialFormat", key: "materials" } };
    const ref = byKey.get(normalizeHeader(match[1]));
    if (!ref) return { error: { code: "material", key: "materials", value: match[1] } };
    const percentage =
      match[2] !== undefined ? parseNumber(match[2]) : parts.length === 1 ? 100 : null;
    if (percentage === null || percentage <= 0) {
      return { error: { code: "materialFormat", key: "materials" } };
    }
    shares.push({ materialTypeId: ref.id, percentage });
  }
  return { value: shares };
}

/** One cell → its value, undefined when blank, or the reason it is wrong. */
export function readCell(
  spec: ColumnSpec,
  raw: string,
  materials: MaterialRef[],
): { value: unknown } | { error: CellError } {
  const text = raw.trim();
  if (!text) return { value: undefined };
  const fail = (code: CellErrorCode) => ({ error: { code, key: spec.key, value: text } });

  switch (spec.type) {
    case "text":
      return { value: text };
    case "int": {
      const n = parseNumber(text);
      return n !== null && Number.isInteger(n) ? { value: n } : fail("integer");
    }
    case "number": {
      const n = parseNumber(text);
      return n !== null ? { value: n } : fail("number");
    }
    case "bool": {
      const b = parseBool(text);
      return b !== null ? { value: b } : fail("bool");
    }
    case "list":
      return { value: splitList(text) };
    case "enum": {
      const code = text.toUpperCase();
      return spec.values?.includes(code) ? { value: code } : fail("enum");
    }
    case "enumList": {
      const codes = splitList(text).map((c) => c.toUpperCase());
      const bad = codes.find((c) => !spec.values?.includes(c));
      return bad
        ? { error: { code: "enum", key: spec.key, value: bad } }
        : { value: codes };
    }
    case "materials":
      return parseMaterials(text, materials);
  }
}

export type ReadRow = {
  values: Record<string, unknown>;
  errors: CellError[];
  /** Every cell blank: the row is skipped, not reported. */
  empty: boolean;
};

/**
 * One spreadsheet row, keyed by its headers. `headerToKey` maps each header
 * (normalized) to its column key, in any of the panel's languages.
 */
export function readRow(
  record: Record<string, string>,
  columns: ColumnSpec[],
  headerToKey: Map<string, string>,
  materials: MaterialRef[],
): ReadRow {
  const byKey = new Map(columns.map((c) => [c.key, c]));
  const values: Record<string, unknown> = {};
  const errors: CellError[] = [];
  let empty = true;

  for (const [header, raw] of Object.entries(record)) {
    const key = headerToKey.get(normalizeHeader(header));
    const spec = key ? byKey.get(key) : undefined;
    const text = String(raw ?? "");
    if (text.trim()) empty = false;
    if (!spec) continue;
    const read = readCell(spec, text, materials);
    if ("error" in read) errors.push(read.error);
    else if (read.value !== undefined) values[spec.key] = read.value;
  }

  // A new row needs the required columns; an existing one only what it sends.
  if (!empty && values.id === undefined) {
    for (const spec of columns) {
      if (spec.required && values[spec.key] === undefined) {
        if (!errors.some((e) => e.key === spec.key)) {
          errors.push({ code: "required", key: spec.key });
        }
      }
    }
  }
  return { values, errors, empty };
}
