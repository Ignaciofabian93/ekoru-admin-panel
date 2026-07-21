"use client";

import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { parseWorkbook } from "@/utils/exportXlsx";
import type { BulkUpsertResult } from "../types";
import { DATA_SHEET, TRANSLATIONS_SHEET } from "../xlsx";

/** A spreadsheet line that failed client-side mapping (before commit). */
type MappingError = { sheet: string; line: number; message: string };

const MAX_LISTED_ERRORS = 10;

/**
 * Bulk import for one catalog table. Expects the workbook produced by the
 * screen's own export: a `data` tab (base rows) and/or a `translations` tab.
 * Rows are mapped client-side (bad cells are reported with their line number),
 * then committed through the bulk upsert mutations — rows with id update, rows
 * without id create. Backend row failures come back in the result and are
 * listed without aborting the rest.
 */
export function CatalogImportDialog<TData, TTranslation>({
  open,
  onClose,
  onImported,
  mapDataRow,
  mapTranslationRow,
  commitData,
  commitTranslations,
}: {
  open: boolean;
  onClose: () => void;
  /** Called after any commit so the list screen can refetch. */
  onImported: () => void;
  mapDataRow: (row: Record<string, string>) => TData;
  mapTranslationRow: (row: Record<string, string>) => TTranslation;
  commitData: (rows: TData[]) => Promise<BulkUpsertResult | null>;
  commitTranslations: (rows: TTranslation[]) => Promise<BulkUpsertResult | null>;
}) {
  const { t } = useTranslation("marketplace");
  const { t: tc } = useTranslation();
  const notify = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [dataRows, setDataRows] = useState<TData[]>([]);
  const [translationRows, setTranslationRows] = useState<TTranslation[]>([]);
  const [mappingErrors, setMappingErrors] = useState<MappingError[]>([]);
  const [committing, setCommitting] = useState(false);
  const [summary, setSummary] = useState<{
    data: BulkUpsertResult | null;
    translations: BulkUpsertResult | null;
  } | null>(null);

  if (!open) return null;

  const reset = () => {
    setFileName(null);
    setParsing(false);
    setDataRows([]);
    setTranslationRows([]);
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
      const sheets = await parseWorkbook(file);
      // Sheet names are matched case-insensitively so hand-built files work.
      const byName = (wanted: string) => {
        const key = Object.keys(sheets).find((n) => n.trim().toLowerCase() === wanted);
        return key ? sheets[key] : undefined;
      };
      const rawData = byName(DATA_SHEET);
      const rawTranslations = byName(TRANSLATIONS_SHEET);

      if (!rawData && !rawTranslations) {
        notify.error(t("import.missingSheets"));
        reset();
        return;
      }

      const errors: MappingError[] = [];
      const mappedData: TData[] = [];
      const mappedTranslations: TTranslation[] = [];

      (rawData ?? []).forEach((row, i) => {
        try {
          mappedData.push(mapDataRow(row));
        } catch (error) {
          errors.push({
            sheet: DATA_SHEET,
            // +2: 1-based line plus the header row, matching what Excel shows.
            line: i + 2,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });
      (rawTranslations ?? []).forEach((row, i) => {
        try {
          mappedTranslations.push(mapTranslationRow(row));
        } catch (error) {
          errors.push({
            sheet: TRANSLATIONS_SHEET,
            line: i + 2,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });

      setFileName(file.name);
      setDataRows(mappedData);
      setTranslationRows(mappedTranslations);
      setMappingErrors(errors);
    } catch {
      notify.error(t("import.invalidFile"));
      reset();
    } finally {
      setParsing(false);
    }
  };

  const totalRows = dataRows.length + translationRows.length;
  const canConfirm = totalRows > 0 && !committing && !summary;

  const handleConfirm = async () => {
    setCommitting(true);
    try {
      // Base rows first so new translations can reference freshly created ids.
      const dataResult = dataRows.length > 0 ? await commitData(dataRows) : null;
      const translationsResult =
        translationRows.length > 0 ? await commitTranslations(translationRows) : null;
      setSummary({ data: dataResult, translations: translationsResult });
      onImported();
    } finally {
      setCommitting(false);
    }
  };

  const summaryFailed =
    (summary?.data?.failed ?? 0) + (summary?.translations?.failed ?? 0);
  const backendErrors = [
    ...(summary?.data?.errors ?? []).map((e) => ({ sheet: DATA_SHEET, ...e })),
    ...(summary?.translations?.errors ?? []).map((e) => ({
      sheet: TRANSLATIONS_SHEET,
      ...e,
    })),
  ];

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
              {t("import.rowsFound", {
                data: String(dataRows.length),
                translations: String(translationRows.length),
              })}
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
                created: String(
                  (summary.data?.created ?? 0) + (summary.translations?.created ?? 0),
                ),
                updated: String(
                  (summary.data?.updated ?? 0) + (summary.translations?.updated ?? 0),
                ),
                failed: String(summaryFailed),
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
