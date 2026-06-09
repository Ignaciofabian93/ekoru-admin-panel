"use client";

import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { parseSpreadsheet } from "@/utils/exportXlsx";

/** Columns a file must contain before it can be imported. */
const REQUIRED_COLUMNS = ["email"];
const PREVIEW_ROWS = 8;

/**
 * Bulk-import scaffold: pick a .xlsx/.csv, parse it client-side, validate the
 * required columns and preview the rows. The final commit is intentionally
 * stubbed — there is no bulk-import mutation in ekoru-users yet, so confirming
 * just reports back. Wire {@link handleConfirm} to that mutation when it lands.
 */
export function ImportSellersDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation("users");
  const { t: tc } = useTranslation();
  const notify = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [parsing, setParsing] = useState(false);

  if (!open) return null;

  const reset = () => {
    setFileName(null);
    setRows([]);
    setHeaders([]);
    setMissing([]);
    setParsing(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setParsing(true);
    try {
      const parsed = await parseSpreadsheet(file);
      const cols = parsed.length ? Object.keys(parsed[0]) : [];
      setFileName(file.name);
      setRows(parsed);
      setHeaders(cols);
      setMissing(REQUIRED_COLUMNS.filter((c) => !cols.includes(c)));
    } catch {
      notify.error(t("import.invalidFile"));
      reset();
    } finally {
      setParsing(false);
    }
  };

  const canConfirm = rows.length > 0 && missing.length === 0;

  const handleConfirm = () => {
    // TODO: call the bulk-import mutation once ekoru-users exposes one. The
    // parsed `rows` are already validated against REQUIRED_COLUMNS here.
    notify.info(t("import.notAvailable"));
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-4 overflow-hidden rounded-lg bg-surface p-6 shadow-xl"
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

        {missing.length > 0 && (
          <Text variant="small" color="error">
            {t("import.missingColumns", { columns: missing.join(", ") })}
          </Text>
        )}

        {rows.length > 0 && (
          <div className="flex min-h-0 flex-col gap-2">
            <Text variant="small" color="secondary">
              {t("import.rowsFound", { count: String(rows.length) })}
            </Text>
            <div className="overflow-auto rounded-md border border-border-light">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-light bg-background-secondary">
                    {headers.map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-foreground-tertiary"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, PREVIEW_ROWS).map((row, i) => (
                    <tr key={i} className="border-b border-border-light last:border-0">
                      {headers.map((h) => (
                        <td
                          key={h}
                          className="whitespace-nowrap px-3 py-2 font-sans text-sm text-foreground"
                        >
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > PREVIEW_ROWS && (
              <Text variant="small" color="tertiary">
                {t("import.showingFirst", { count: String(PREVIEW_ROWS) })}
              </Text>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <MainButton
            text={tc("common.cancel")}
            variant="outline"
            size="sm"
            onPress={handleClose}
          />
          <MainButton
            text={t("import.confirm")}
            size="sm"
            disabled={!canConfirm}
            onPress={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
}
