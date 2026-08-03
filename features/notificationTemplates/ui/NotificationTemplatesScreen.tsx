"use client";

import { DatabaseBackup, Download, Plus, Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { Badge } from "@/components/Badge/Badge";
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
import { useNotificationTemplates } from "../hooks/useNotificationTemplates";
import { useNotificationTemplateMutations } from "../hooks/useNotificationTemplateMutations";
import { notificationTemplatePaths } from "../paths";
import type { NotificationTemplate } from "../types";
import {
  DATA_SHEET,
  TRANSLATIONS_SHEET,
  buildNotificationTemplateSheets,
  mapNotificationTemplateRow,
  mapNotificationTemplateTranslationRow,
} from "../xlsx";

export function NotificationTemplatesScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("notificationTemplates");
  const notify = useToast();
  const { navigateTo } = useNavigation();

  const { templates, loading, refetch } = useNotificationTemplates();
  const { upsertTemplates, upsertTranslations } = useNotificationTemplateMutations();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Map<number, NotificationTemplate>>(new Map());
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState<null | "selected" | "all">(null);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return templates;
    return templates.filter((r) => r.type.toLowerCase().includes(needle));
  }, [templates, search]);

  const toggleRow = (row: NotificationTemplate) =>
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
      const exportRows = which === "selected" ? [...selected.values()] : templates;
      if (exportRows.length === 0) {
        notify.info(t("export.nothing"));
        return;
      }
      await exportWorkbookToXlsx({
        sheets: buildNotificationTemplateSheets(exportRows),
        fileName: `notification-templates-${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(null);
    }
  };

  const columns: Column<NotificationTemplate>[] = [
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
      key: "type",
      header: t("fields.type"),
      render: (r) => (
        <Text variant="span" weight="semibold">
          {r.type}
        </Text>
      ),
    },
    {
      key: "title",
      header: t("fields.title"),
      render: (r) => (
        <Text variant="span" color="secondary">
          {r.title}
        </Text>
      ),
    },
    {
      key: "isActive",
      header: t("fields.isActive"),
      align: "center",
      render: (r) => (
        <Badge tone={r.isActive ? "success" : "neutral"}>
          {r.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
      ),
    },
    {
      key: "translations",
      header: t("translations.title"),
      align: "center",
      render: (r) => (
        <Text variant="span" color="tertiary">
          {r.translations?.length ?? 0}
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
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Title level="h1" size="h3" weight="bold">
              {t("title")}
            </Title>
            <Text variant="p" color="secondary">
              {t("subtitle")}
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
              onPress={() => navigateTo({ route: notificationTemplatePaths.new(lang) })}
            />
          </div>
        </header>

        <Input
          name="search"
          type="search"
          placeholder={t("searchPlaceholder")}
          leftIcon={Search}
          value={search}
          onChangeText={setSearch}
        />

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(r) => String(r.id)}
          emptyLabel={t("empty")}
          selection={{
            isRowSelected: (r) => selected.has(r.id),
            onToggleRow: toggleRow,
            allSelected,
            someSelected,
            onToggleAll: toggleAll,
          }}
          onRowClick={(r) =>
            navigateTo({ route: notificationTemplatePaths.edit(lang, r.id) })
          }
        />
      </div>

      <BulkImportDialog
        open={importOpen}
        namespace="notificationTemplates"
        onClose={() => setImportOpen(false)}
        onImported={() => void refetch()}
        sheets={[
          importSheet({
            sheet: DATA_SHEET,
            map: mapNotificationTemplateRow,
            commit: (r) => upsertTemplates(r, false),
          }),
          importSheet({
            sheet: TRANSLATIONS_SHEET,
            map: mapNotificationTemplateTranslationRow,
            commit: (r) => upsertTranslations(r, false),
          }),
        ]}
      />
    </PermissionGate>
  );
}
