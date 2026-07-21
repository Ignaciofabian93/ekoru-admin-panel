"use client";

import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { parseWorkbook } from "@/utils/exportXlsx";

/** Result shape shared by every `UsersBulkUpsertResult`-style backend mutation. */
export type BulkResult = {
  created: number;
  createdIds: (number | string)[];
  updated: number;
  failed: number;
  errors: { index: number; id: number | string | null; message: string }[];
};

/**
 * One tab of an import workbook: the sheet name to read, a row mapper, and the
 * bulk mutation that commits it. Specs commit in array order, so list parents
 * before children (e.g. countries → country-translations → regions → cities).
 */
export type ImportSheetSpec = {
  sheet: string;
  map: (row: Record<string, string>) => unknown;
  commit: (rows: unknown[]) => Promise<BulkResult | null>;
};

/**
 * Type-safe builder for an {@link ImportSheetSpec}: keeps `map`/`commit` checked
 * against `T`, then erases the type so specs over different row shapes can share
 * one array.
 */
export function importSheet<T>(spec: {
  sheet: string;
  map: (row: Record<string, string>) => T;
  commit: (rows: T[]) => Promise<BulkResult | null>;
}): ImportSheetSpec {
  return spec as unknown as ImportSheetSpec;
}

type MappingError = { sheet: string; line: number; message: string };
type MappedSheet = { sheet: string; rows: unknown[]; spec: ImportSheetSpec };
type SheetSummary = { sheet: string; result: BulkResult | null };

const MAX_LISTED_ERRORS = 12;

/**
 * Reusable bulk-import dialog. Feature-agnostic: reads its labels from the
 * `namespace` i18n dictionary (needs an `import.*` block) and commits each sheet
 * through the caller's mutations. Rows with an id update, rows without an id
 * create. Bad cells are reported with their line before commit; backend row
 * failures come back in the result and are listed without aborting the rest.
 */
export function BulkImportDialog({
  open,
  namespace,
  sheets,
  onClose,
  onImported,
}: {
  open: boolean;
  /** i18n namespace holding the `import.*` keys (e.g. "locations"). */
  namespace: string;
  sheets: ImportSheetSpec[];
  onClose: () => void;
  /** Called after any commit so the list screen can refetch. */
  onImported: () => void;
}) {
  const { t } = useTranslation(namespace);
  const { t: tc } = useTranslation();
  const notify = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [mapped, setMapped] = useState<MappedSheet[]>([]);
  const [mappingErrors, setMappingErrors] = useState<MappingError[]>([]);
  const [committing, setCommitting] = useState(false);
  const [summary, setSummary] = useState<SheetSummary[] | null>(null);

  if (!open) return null;

  const reset = () => {
    setFileName(null);
    setParsing(false);
    setMapped([]);
    setMappingErrors([]);
    setCommitting(false);
    setSummary(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setParsing(true);
    setSummary(null);
    try {
      const workbook = await parseWorkbook(file);
      // Sheet names are matched case-insensitively so hand-built files work.
      const byName = (wanted: string) => {
        const key = Object.keys(workbook).find(
          (n) => n.trim().toLowerCase() === wanted.trim().toLowerCase(),
        );
        return key ? workbook[key] : undefined;
      };

      const present = sheets.filter((s) => byName(s.sheet) !== undefined);
      if (present.length === 0) {
        notify.error(t("import.missingSheets"));
        reset();
        return;
      }

      const errors: MappingError[] = [];
      const nextMapped: MappedSheet[] = [];

      for (const spec of sheets) {
        const raw = byName(spec.sheet);
        if (!raw) continue;
        const rows: unknown[] = [];
        raw.forEach((row, i) => {
          try {
            rows.push(spec.map(row));
          } catch (error) {
            errors.push({
              sheet: spec.sheet,
              // +2: 1-based line plus the header row, matching Excel.
              line: i + 2,
              message: error instanceof Error ? error.message : String(error),
            });
          }
        });
        nextMapped.push({ sheet: spec.sheet, rows, spec });
      }

      setFileName(file.name);
      setMapped(nextMapped);
      setMappingErrors(errors);
    } catch {
      notify.error(t("import.invalidFile"));
      reset();
    } finally {
      setParsing(false);
    }
  };

  const totalRows = mapped.reduce((sum, m) => sum + m.rows.length, 0);
  const canConfirm = totalRows > 0 && !committing && !summary;

  const handleConfirm = async () => {
    setCommitting(true);
    try {
      const results: SheetSummary[] = [];
      // Commit in spec order so parents exist before children reference them.
      for (const m of mapped) {
        if (m.rows.length === 0) continue;
        results.push({ sheet: m.sheet, result: await m.spec.commit(m.rows) });
      }
      setSummary(results);
      onImported();
    } finally {
      setCommitting(false);
    }
  };

  const totals = (summary ?? []).reduce(
    (acc, s) => ({
      created: acc.created + (s.result?.created ?? 0),
      updated: acc.updated + (s.result?.updated ?? 0),
      failed: acc.failed + (s.result?.failed ?? 0),
    }),
    { created: 0, updated: 0, failed: 0 },
  );
  const backendErrors = (summary ?? []).flatMap((s) =>
    (s.result?.errors ?? []).map((e) => ({ sheet: s.sheet, ...e })),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-lg bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Title level="h2" size="h5" weight="bold">
              {t("import.title")}
            </Title>
            <Text variant="small" color="secondary">
              {t("import.subtitle")}
            </Text>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={tc("common.cancel")}
            className="flex cursor-pointer items-center rounded-md p-1 text-foreground-tertiary transition-colors hover:bg-surface-hover"
          >
            <X size={20} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-input-border bg-background-secondary px-4 py-8 text-center transition-colors hover:border-primary"
        >
          <Upload size={24} className="text-foreground-tertiary" />
          <Text variant="span" weight="semibold">
            {fileName ?? t("import.choose")}
          </Text>
          <Text variant="small" color="tertiary">
            {t("import.dropHint")}
          </Text>
        </button>

        {parsing && (
          <Text variant="small" color="secondary">
            {t("import.parsing")}
          </Text>
        )}

        {fileName && !parsing && !summary && (
          <div className="flex flex-col gap-1">
            <Text variant="small" color="secondary">
              {t("import.rowsFound", { count: String(totalRows) })}
            </Text>
            <Text variant="small" color="tertiary">
              {mapped
                .filter((m) => m.rows.length > 0)
                .map((m) => `${m.sheet}: ${m.rows.length}`)
                .join(" · ")}
            </Text>
            <Text variant="small" color="tertiary">
              {t("import.upsertHint")}
            </Text>
          </div>
        )}

        {mappingErrors.length > 0 && !summary && (
          <div className="flex flex-col gap-1 rounded-md border border-border-light bg-background-secondary p-3">
            <Text variant="small" color="error" weight="semibold">
              {t("import.mappingErrors", { count: String(mappingErrors.length) })}
            </Text>
            {mappingErrors.slice(0, MAX_LISTED_ERRORS).map((e, i) => (
              <Text key={i} variant="small" color="error">
                {`[${e.sheet}] ${t("import.line")} ${e.line}: ${e.message}`}
              </Text>
            ))}
          </div>
        )}

        {summary && (
          <div className="flex flex-col gap-1 rounded-md border border-border-light bg-background-secondary p-3">
            <Text variant="small" weight="semibold">
              {t("import.doneSummary", {
                created: String(totals.created),
                updated: String(totals.updated),
                failed: String(totals.failed),
              })}
            </Text>
            {backendErrors.slice(0, MAX_LISTED_ERRORS).map((e, i) => (
              <Text key={i} variant="small" color="error">
                {`[${e.sheet}] ${t("import.row")} ${e.index + 1}${e.id ? ` (id ${e.id})` : ""}: ${e.message}`}
              </Text>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <MainButton
            text={tc("common.cancel")}
            variant="outline"
            size="sm"
            onPress={handleClose}
          />
          {!summary && (
            <MainButton
              text={t("import.confirm")}
              size="sm"
              loading={committing}
              disabled={!canConfirm}
              onPress={handleConfirm}
            />
          )}
        </div>
      </div>
    </div>
  );
}
