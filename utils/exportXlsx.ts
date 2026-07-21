/**
 * Generic spreadsheet export. Stays dumb about the entity: pass typed rows and a
 * column spec (`header` + accessor), it builds a single-sheet workbook and
 * triggers a browser download. SheetJS is loaded lazily via dynamic import so it
 * never ships in the initial bundle — it only loads the first time someone
 * exports.
 */
export type ExportColumn<T> = {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
};

export async function exportToXlsx<T>({
  rows,
  columns,
  fileName,
  sheetName = "Sheet1",
}: {
  rows: T[];
  columns: ExportColumn<T>[];
  fileName: string;
  sheetName?: string;
}): Promise<void> {
  const XLSX = await import("xlsx");

  const data = rows.map((row) => {
    const record: Record<string, string | number | boolean> = {};
    for (const col of columns) {
      const v = col.value(row);
      record[col.header] = v ?? "";
    }
    return record;
  });

  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: columns.map((c) => c.header),
  });
  const workbook = XLSX.utils.book_new();
  // Sheet names are capped at 31 chars by the format.
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, fileName);
}

/**
 * Reads the first sheet of an uploaded spreadsheet (.xlsx/.csv) into plain row
 * objects keyed by header. Used by the bulk-import flow to preview a file before
 * committing it. Header cells are coerced to strings; blank cells become "".
 */
export async function parseSpreadsheet(file: File): Promise<Record<string, string>[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) return [];
  const worksheet = workbook.Sheets[firstSheet];
  return XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
    defval: "",
    raw: false,
  });
}

/** A sheet already flattened to plain records, ready to append to a workbook. */
export type BuiltSheet = {
  name: string;
  headers: string[];
  data: Record<string, string | number | boolean>[];
};

/**
 * Flattens typed rows + columns into a {@link BuiltSheet}. Erases the row type
 * so sheets over different entities can travel in one array to
 * {@link exportWorkbookToXlsx}.
 */
export function buildSheet<T>({
  name,
  rows,
  columns,
}: {
  name: string;
  rows: T[];
  columns: ExportColumn<T>[];
}): BuiltSheet {
  const data = rows.map((row) => {
    const record: Record<string, string | number | boolean> = {};
    for (const col of columns) {
      const v = col.value(row);
      record[col.header] = v ?? "";
    }
    return record;
  });
  return { name, headers: columns.map((c) => c.header), data };
}

/**
 * Multi-sheet sibling of {@link exportToXlsx}: builds one workbook with a tab
 * per built sheet (e.g. base rows + their translations) and triggers a browser
 * download. Sheets keep their given order; names are capped at the format's
 * 31-char limit.
 */
export async function exportWorkbookToXlsx({
  sheets,
  fileName,
}: {
  sheets: BuiltSheet[];
  fileName: string;
}): Promise<void> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data, {
      header: sheet.headers,
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
  }

  XLSX.writeFile(workbook, fileName);
}

/**
 * Reads every sheet of an uploaded workbook into plain row objects keyed by
 * header, grouped by sheet name. Blank cells become "". Used by multi-sheet
 * bulk imports (base rows + translations).
 */
export async function parseWorkbook(
  file: File,
): Promise<Record<string, Record<string, string>[]>> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheets: Record<string, Record<string, string>[]> = {};
  for (const name of workbook.SheetNames) {
    sheets[name] = XLSX.utils.sheet_to_json<Record<string, string>>(
      workbook.Sheets[name],
      { defval: "", raw: false },
    );
  }
  return sheets;
}
