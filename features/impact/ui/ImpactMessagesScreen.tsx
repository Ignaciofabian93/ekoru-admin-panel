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
import { useImpactMutations } from "../hooks/useImpactMutations";
import { useRawMessages } from "../hooks/useImpact";
import { impactPaths } from "../paths";
import type { ImpactMessageKind, RawImpactMessage } from "../types";
import {
  DATA_SHEET,
  TRANSLATIONS_SHEET,
  buildImpactMessageSheets,
  mapImpactMessageDataRow,
  mapImpactMessageTranslationRow,
} from "../xlsx";
import { ImpactPagination } from "./ImpactPagination";

export function ImpactMessagesScreen({
  lang,
  kind,
}: {
  lang: SupportedLanguage;
  kind: ImpactMessageKind;
}) {
  const { t } = useTranslation("impact");
  const notify = useToast();
  const { navigateTo } = useNavigation();
  const kindLabel = t(`kind.${kind}`);
  const {
    rows,
    pageInfo,
    loading,
    refetch,
    fetchAll,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useRawMessages(kind);
  const { upsertMessages, upsertMessageTranslations } = useImpactMutations();

  const [selected, setSelected] = useState<Map<number, RawImpactMessage>>(new Map());
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState<null | "selected" | "all">(null);

  const toggleRow = (row: RawImpactMessage) =>
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

  const fileStamp = () => new Date().toISOString().slice(0, 10);

  const runExport = async (which: "selected" | "all") => {
    setExporting(which);
    try {
      const exportRows = which === "selected" ? [...selected.values()] : await fetchAll();
      if (exportRows.length === 0) {
        notify.info(t("export.nothing"));
        return;
      }
      await exportWorkbookToXlsx({
        sheets: buildImpactMessageSheets(kind, exportRows),
        fileName: `${kind}-impact-messages-${fileStamp()}.xlsx`,
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(null);
    }
  };

  const columns: Column<RawImpactMessage>[] = [
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
    {
      key: "range",
      header: t("fields.range"),
      render: (r) => (
        <Text variant="span" weight="semibold">
          {`${r.min} – ${r.max}`}
        </Text>
      ),
    },
    {
      key: "message1",
      header: t("fields.message1"),
      render: (r) => (
        <Text variant="span" color="secondary">
          {r.message1}
        </Text>
      ),
    },
    {
      key: "translations",
      header: t("fields.translations"),
      align: "center",
      render: (r) => (
        <Text variant="span" color="tertiary">
          {r.translations.length}/5
        </Text>
      ),
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Title level="h1" size="h3" weight="bold">
              {t("messages.title", { kind: kindLabel })}
            </Title>
            <Text variant="p" color="secondary">
              {t("messages.subtitle", { kind: kindLabel })}
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
              onPress={() => navigateTo({ route: impactPaths.messageNew(lang, kind) })}
            />
          </div>
        </header>

        <div className="max-w-sm">
          <Input
            name="search"
            type="search"
            placeholder={t("messages.searchPlaceholder")}
            leftIcon={Search}
            value={search}
            onChangeText={setSearch}
          />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(r) => String(r.id)}
          emptyLabel={t("messages.empty", { kind: kindLabel })}
          selection={{
            isRowSelected: (r) => selected.has(r.id),
            onToggleRow: toggleRow,
            allSelected,
            someSelected,
            onToggleAll: toggleAll,
          }}
          onRowClick={(r) =>
            navigateTo({ route: impactPaths.messageEdit(lang, kind, r.id) })
          }
        />

        <ImpactPagination
          pageInfo={pageInfo}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>

      <BulkImportDialog
        open={importOpen}
        namespace="impact"
        onClose={() => setImportOpen(false)}
        onImported={() => void refetch()}
        sheets={[
          importSheet({
            sheet: DATA_SHEET,
            map: mapImpactMessageDataRow,
            commit: (r) => upsertMessages(kind, r, false),
          }),
          importSheet({
            sheet: TRANSLATIONS_SHEET,
            map: (row) => mapImpactMessageTranslationRow(kind, row),
            commit: (r) => upsertMessageTranslations(kind, r, false),
          }),
        ]}
      />
    </PermissionGate>
  );
}
