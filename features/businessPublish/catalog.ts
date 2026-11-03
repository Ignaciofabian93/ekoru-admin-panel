import { SERVICE_PRICING } from "@/features/services/types";
import {
  BADGES,
  DIMENSION_UNITS,
  PRODUCT_SIZES,
  WEIGHT_UNITS,
} from "@/features/storeProducts/types";
import { buildSheet, exportWorkbookToXlsx, parseWorkbook } from "@/utils/exportXlsx";
import {
  normalizeHeader,
  readRow,
  type CellError,
  type ColumnSpec,
  type MaterialRef,
} from "./cells";
import en from "./i18n/locales/en.json";
import es from "./i18n/locales/es.json";
import fr from "./i18n/locales/fr.json";

/** The two catalogs a business publishes from the panel (ADM-16). */
export type CatalogKind = "products" | "services";

/** Rows per file. The panel sends them to the server 100 at a time. */
export const MAX_ROWS_PER_FILE = 1000;
export const ROWS_PER_REQUEST = 100;

/** The columns of each data sheet, in order. Keys are the GraphQL input fields. */
export const COLUMNS: Record<CatalogKind, ColumnSpec[]> = {
  products: [
    { key: "id", type: "int" },
    { key: "name", type: "text", required: true },
    { key: "description", type: "text", required: true },
    { key: "subCategoryId", type: "int", required: true },
    { key: "price", type: "int", required: true },
    { key: "stock", type: "int", required: true },
    { key: "materials", type: "materials", required: true },
    { key: "hasOffer", type: "bool" },
    { key: "offerPrice", type: "int" },
    { key: "brand", type: "text" },
    { key: "color", type: "text" },
    { key: "sku", type: "text" },
    { key: "barcode", type: "text" },
    { key: "weight", type: "number" },
    { key: "weightUnit", type: "enum", values: WEIGHT_UNITS },
    { key: "size", type: "enum", values: PRODUCT_SIZES },
    { key: "length", type: "number" },
    { key: "width", type: "number" },
    { key: "height", type: "number" },
    { key: "dimensionUnit", type: "enum", values: DIMENSION_UNITS },
    { key: "recycledContent", type: "number" },
    { key: "warranty", type: "bool" },
    { key: "warrantyDuration", type: "int" },
    { key: "tags", type: "list" },
    { key: "features", type: "list" },
    { key: "badges", type: "enumList", values: BADGES },
    { key: "isActive", type: "bool" },
    { key: "images", type: "list" },
  ],
  services: [
    { key: "id", type: "int" },
    { key: "name", type: "text", required: true },
    { key: "description", type: "text" },
    { key: "subcategoryId", type: "int", required: true },
    { key: "pricingType", type: "enum", values: SERVICE_PRICING, required: true },
    { key: "basePrice", type: "number" },
    { key: "priceRange", type: "text" },
    { key: "duration", type: "int" },
    { key: "isRemoteService", type: "bool" },
    { key: "serviceRadius", type: "int" },
    { key: "tags", type: "list" },
    { key: "isActive", type: "bool" },
    { key: "images", type: "list" },
  ],
};

const DICTIONARIES = [es, en, fr];

/**
 * Header → column key, for headers written in any of the panel's languages (or
 * the bare key), so a template downloaded in Spanish still imports when the
 * panel is in English.
 */
function headerMap(kind: CatalogKind): Map<string, string> {
  const map = new Map<string, string>();
  for (const spec of COLUMNS[kind]) {
    map.set(normalizeHeader(spec.key), spec.key);
    for (const dict of DICTIONARIES) {
      const labels = dict.columns[kind] as Record<string, string>;
      if (labels[spec.key]) map.set(normalizeHeader(labels[spec.key]), spec.key);
    }
  }
  return map;
}

/** The data sheet: the one named for the kind in any language, else the first. */
function dataSheetName(kind: CatalogKind, names: string[]): string | undefined {
  const wanted = new Set(DICTIONARIES.map((d) => normalizeHeader(d.sheets[kind])));
  return names.find((n) => wanted.has(normalizeHeader(n))) ?? names[0];
}

type T = (key: string, params?: Record<string, string>) => string;

export type CatalogRefs = {
  categories: {
    id: number;
    name: string;
    subCategoryItems: { id: number; name: string }[];
  }[];
  materials: MaterialRef[];
};

/** The column header in the panel's language. */
export const columnLabel = (t: T, kind: CatalogKind, key: string) =>
  t(`columns.${kind}.${key}`);

/** A cell value as the export writes it. */
function cellText(
  t: T,
  spec: ColumnSpec,
  value: unknown,
  materials: MaterialRef[],
): string | number {
  if (value === null || value === undefined) return "";
  switch (spec.type) {
    case "bool":
      return t(value ? "values.yes" : "values.no");
    case "list":
    case "enumList":
      return (value as string[]).join(" | ");
    case "materials": {
      const code = (id: number) => materials.find((m) => m.id === id)?.materialType ?? id;
      return (value as { materialTypeId: number; percentage: number }[])
        .map((m) => `${code(m.materialTypeId)}:${m.percentage}`)
        .join(" | ");
    }
    default:
      return value as string | number;
  }
}

/**
 * The workbook a business fills in: the data sheet (empty, or its current
 * catalog with ids), then instructions, categories, materials (products only)
 * and the allowed values. The reference sheets are ignored on import.
 */
export async function downloadWorkbook({
  kind,
  t,
  refs,
  rows = [],
  fileName,
}: {
  kind: CatalogKind;
  t: T;
  refs: CatalogRefs;
  rows?: Record<string, unknown>[];
  fileName: string;
}) {
  const columns = COLUMNS[kind];
  const data = buildSheet({
    name: t(`sheets.${kind}`),
    rows,
    columns: columns.map((spec) => ({
      header: columnLabel(t, kind, spec.key),
      value: (row: Record<string, unknown>) =>
        cellText(t, spec, row[spec.key], refs.materials),
    })),
  });

  const lineCount = kind === "products" ? 10 : 9;
  const example = refs.materials
    .slice(0, 2)
    .map((m, i) => `${m.materialType}:${i === 0 ? 60 : 40}`)
    .join(" | ");
  const instructions = buildSheet({
    name: t("sheets.instructions"),
    rows: Array.from({ length: lineCount }, (_, i) =>
      t(`instructions.${kind}.${i + 1}`, { example, max: String(MAX_ROWS_PER_FILE) }),
    ),
    columns: [{ header: t("refs.instruction"), value: (line: string) => line }],
  });

  const categoryRows = refs.categories.flatMap((c) =>
    c.subCategoryItems.map((s) => ({ id: s.id, category: c.name, subcategory: s.name })),
  );
  const categories = buildSheet({
    name: t("sheets.categories"),
    rows: categoryRows,
    columns: [
      { header: t("refs.subcategoryId"), value: (r) => r.id },
      { header: t("refs.category"), value: (r) => r.category },
      { header: t("refs.subcategory"), value: (r) => r.subcategory },
    ],
  });

  const enumColumns = columns.filter((c) => c.values);
  const values = buildSheet({
    name: t("sheets.values"),
    rows: enumColumns,
    columns: [
      { header: t("refs.column"), value: (c) => columnLabel(t, kind, c.key) },
      { header: t("refs.allowed"), value: (c) => (c.values ?? []).join(" | ") },
    ],
  });

  const sheets = [data, instructions, categories];
  if (kind === "products") {
    sheets.push(
      buildSheet({
        name: t("sheets.materials"),
        rows: refs.materials,
        columns: [
          { header: t("refs.materialCode"), value: (m) => m.materialType },
          { header: t("refs.material"), value: (m) => m.label },
        ],
      }),
    );
  }
  sheets.push(values);
  await exportWorkbookToXlsx({ sheets, fileName });
}

/** One data row of an uploaded file, ready to send or with what is wrong. */
export type ParsedRow = {
  /** The spreadsheet row number, counting the header as row 1. */
  rowNumber: number;
  name: string;
  values: Record<string, unknown>;
  errors: CellError[];
};

/** Reads an uploaded workbook's data sheet into rows; blank rows are dropped. */
export async function readWorkbook({
  kind,
  file,
  materials,
}: {
  kind: CatalogKind;
  file: File;
  materials: MaterialRef[];
}): Promise<ParsedRow[]> {
  const sheets = await parseWorkbook(file);
  const name = dataSheetName(kind, Object.keys(sheets));
  const records = name ? sheets[name] : [];
  const map = headerMap(kind);
  const rows: ParsedRow[] = [];
  records.forEach((record, i) => {
    const read = readRow(record, COLUMNS[kind], map, materials);
    if (read.empty) return;
    rows.push({
      rowNumber: i + 2,
      name: typeof read.values.name === "string" ? read.values.name : "",
      values: read.values,
      errors: read.errors,
    });
  });
  return rows;
}

/** A cell error in the panel's language. */
export function cellErrorText(t: T, kind: CatalogKind, error: CellError): string {
  const spec = COLUMNS[kind].find((c) => c.key === error.key);
  const column = columnLabel(t, kind, error.key).replace(/\s*\*$/, "");
  return t(`errors.${error.code}`, {
    column,
    value: error.value ?? "",
    values: (spec?.values ?? []).join(", "),
  });
}

/** What happened to one row after publishing. */
export type RowOutcome = {
  rowNumber: number;
  name: string;
  outcome: "created" | "updated" | "hidden" | "error";
  id?: number;
  message?: string;
};
