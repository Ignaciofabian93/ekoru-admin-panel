"use client";

import { DatabaseBackup, Download, Plus, Search, Upload } from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { exportWorkbookToXlsx } from "@/utils/exportXlsx";
import { useStoreCatalogMutations } from "../hooks/useStoreCatalogMutations";
import { useRawStoreCategories } from "../hooks/useRawStoreCatalog";
import { storePaths } from "../paths";
import { displayName, type RawStoreCategory } from "../types";
import {
  buildStoreCategorySheets,
  mapStoreCategoryDataRow,
  mapStoreCategoryTranslationRow,
} from "../xlsx";
import { StoreCatalogImportDialog } from "./StoreCatalogImportDialog";
import { StoreCatalogPagination } from "./StoreCatalogPagination";

export function StoreCategoriesScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("stores");
  const notify = useToast();
  const { navigateTo } = useNavigation();
  const language = useGqlLanguage();
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
  } = useRawStoreCategories();
  const { upsertStoreCategories, upsertStoreCategoryTranslations } =
    useStoreCatalogMutations();

  const [selected, setSelected] = useState<Map<number, RawStoreCategory>>(new Map());
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState<null | "selected" | "all">(null);

  const toggleRow = (row: RawStoreCategory) =>
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
        sheets: buildStoreCategorySheets(exportRows),
        fileName: `store-categories-${fileStamp()}.xlsx`,
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(null);
    }
  };

  const columns: Column<RawStoreCategory>[] = [
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
      key: "name",
      header: t("fields.name"),
      render: (r) => (
        <Text variant="span" weight="semibold">
          {displayName(r, language)}
        </Text>
      ),
    },
    {
      key: "slug",
      header: t("fields.slug"),
      render: (r) => (
        <Text variant="span" color="secondary">
          {r.translations.find((tr) => tr.language === language)?.slug ??
            r.translations[0]?.slug ??
            "—"}
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
    {
      key: "sortOrder",
      header: t("fields.sortOrder"),
      align: "right",
      render: (r) => (
        <Text variant="span" color="tertiary">
          {r.sortOrder}
        </Text>
      ),
    },
    {
      key: "isActive",
      header: t("fields.isActive"),
      align: "center",
      render: (r) => (
        <Badge tone={r.isActive ? "success" : "danger"}>
          {r.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
      ),
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_CATEGORIES"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Title level="h1" size="h3" weight="bold">
              {t("storeCategories.title")}
            </Title>
            <Text variant="p" color="secondary">
              {t("storeCategories.subtitle")}
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
              onPress={() => navigateTo({ route: storePaths.storeCategoryNew(lang) })}
            />
          </div>
        </header>

        <div className="max-w-sm">
          <Input
            name="search"
            type="search"
            placeholder={t("searchPlaceholder")}
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
          emptyLabel={t("storeCategories.empty")}
          selection={{
            isRowSelected: (r) => selected.has(r.id),
            onToggleRow: toggleRow,
            allSelected,
            someSelected,
            onToggleAll: toggleAll,
          }}
          onRowClick={(r) =>
            navigateTo({ route: storePaths.storeCategoryEdit(lang, r.id) })
          }
        />

        <StoreCatalogPagination
          pageInfo={pageInfo}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>

      <StoreCatalogImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => void refetch()}
        mapDataRow={mapStoreCategoryDataRow}
        mapTranslationRow={mapStoreCategoryTranslationRow}
        commitData={(r) => upsertStoreCategories(r, false)}
        commitTranslations={(r) => upsertStoreCategoryTranslations(r, false)}
      />
    </PermissionGate>
  );
}
