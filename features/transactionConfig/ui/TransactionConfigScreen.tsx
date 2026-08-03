"use client";

import { DatabaseBackup, Download, Plus, Search, Upload } from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import {
  BulkImportDialog,
  importSheet,
} from "@/components/BulkImportDialog/BulkImportDialog";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { exportWorkbookToXlsx } from "@/utils/exportXlsx";
import { useRawTransactionConfig } from "../hooks/useRawTransactionConfig";
import { useTransactionConfigMutations } from "../hooks/useTransactionConfigMutations";
import { transactionConfigPaths } from "../paths";
import { KIND_CONFIG, type TxConfigKind, type TxId, type TxRow } from "../types";
import {
  DATA_SHEET,
  buildTransactionConfigSheets,
  mapTransactionConfigRow,
} from "../xlsx";

export function TransactionConfigScreen({
  kind,
  lang,
}: {
  kind: TxConfigKind;
  lang: SupportedLanguage;
}) {
  const cfg = KIND_CONFIG[kind];
  const paths = transactionConfigPaths(kind);
  const { t } = useTranslation("transactionConfig");
  const notify = useToast();
  const { navigateTo } = useNavigation();

  const { rows, loading, refetch, fetchAll, search, setSearch } =
    useRawTransactionConfig(kind);
  const { upsert } = useTransactionConfigMutations(kind);

  const [selected, setSelected] = useState<Map<TxId, TxRow>>(new Map());
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState<null | "selected" | "all">(null);

  const toggleRow = (row: TxRow) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(row.id)) next.delete(row.id);
      else next.set(row.id, row);
      return next;
    });
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = rows.some((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (allSelected) rows.forEach((r) => next.delete(r.id));
      else rows.forEach((r) => next.set(r.id, r));
      return next;
    });

  const runExport = async (which: "selected" | "all") => {
    setExporting(which);
    try {
      const exportRows = which === "selected" ? [...selected.values()] : await fetchAll();
      if (exportRows.length === 0) {
        notify.info(t("export.nothing"));
        return;
      }
      await exportWorkbookToXlsx({
        sheets: buildTransactionConfigSheets(kind, exportRows),
        fileName: `${cfg.route}-${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(null);
    }
  };

  const columns: Column<TxRow>[] = [
    {
      key: "id",
      header: "ID",
      align: "right",
      render: (r) => (
        <Text variant="span" color="tertiary">
          {r.id}
        </Text>
      ),
    },
    ...cfg.fields.map<Column<TxRow>>((f) => ({
      key: f.key,
      header: t(`fields.${f.key}`),
      render: (r) => {
        const value = r[f.key];
        return (
          <Text
            variant="span"
            weight={f.key === cfg.primaryField ? "semibold" : undefined}
            color={f.key === cfg.primaryField ? undefined : "secondary"}
          >
            {value == null || value === "" ? "—" : String(value)}
          </Text>
        );
      },
    })),
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Title level="h1" size="h3" weight="bold">
              {t(`kinds.${kind}.title`)}
            </Title>
            <Text variant="p" color="secondary">
              {t(`kinds.${kind}.subtitle`)}
            </Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MainButton
              text={t("actions.import")}
              leftIcon={Upload}
              variant="outline"
              size="sm"
              onPress={() => setImportOpen(true)}
            />
            <MainButton
              text={
                selected.size > 0
                  ? `${t("actions.export")} (${selected.size})`
                  : t("actions.export")
              }
              leftIcon={Download}
              size="sm"
              variant="secondary_outline"
              loading={exporting === "selected"}
              disabled={selected.size === 0 || exporting !== null}
              onPress={() => runExport("selected")}
            />
            <MainButton
              text={t("actions.exportAll")}
              leftIcon={DatabaseBackup}
              variant="secondary_outline"
              size="sm"
              loading={exporting === "all"}
              disabled={exporting !== null}
              onPress={() => runExport("all")}
            />
            <MainButton
              text={t("actions.new")}
              leftIcon={Plus}
              size="sm"
              onPress={() => navigateTo({ route: paths.new(lang) })}
            />
          </div>
        </header>

        <Input
          name="search"
          type="search"
          placeholder={t(`kinds.${kind}.searchPlaceholder`)}
          leftIcon={Search}
          value={search}
          onChangeText={setSearch}
        />

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(r) => String(r.id)}
          emptyLabel={t(`kinds.${kind}.empty`)}
          selection={{
            isRowSelected: (r) => selected.has(r.id),
            onToggleRow: toggleRow,
            allSelected,
            someSelected,
            onToggleAll: toggleAll,
          }}
          onRowClick={(r) => navigateTo({ route: paths.edit(lang, r.id) })}
        />
      </div>

      <BulkImportDialog
        open={importOpen}
        namespace="transactionConfig"
        onClose={() => setImportOpen(false)}
        onImported={() => void refetch()}
        sheets={[
          importSheet({
            sheet: DATA_SHEET,
            map: mapTransactionConfigRow(kind),
            commit: (r) => upsert(r, false),
          }),
        ]}
      />
    </PermissionGate>
  );
}
