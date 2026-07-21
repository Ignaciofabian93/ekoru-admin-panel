"use client";

import { DatabaseBackup, Download, Plus, Search, Upload } from "lucide-react";
import { useState } from "react";
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
import { Select } from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { exportWorkbookToXlsx } from "@/utils/exportXlsx";
import { useBlogCommunityMutations } from "../hooks/useBlogCommunityMutations";
import {
  useCommunityCategoryOptions,
  useRawCommunitySubCategories,
} from "../hooks/useRawBlogCommunityCatalog";
import { catalogPaths } from "../paths";
import { displayName, type RawCommunitySubCategory } from "../types";
import {
  DATA_SHEET,
  TRANSLATIONS_SHEET,
  buildCommunitySubCategorySheets,
  mapCommunitySubCategoryDataRow,
  mapCommunitySubCategoryTranslationRow,
} from "../xlsx";
import { CatalogPagination } from "./CatalogPagination";

export function CommunitySubCategoriesScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("blogCommunity");
  const notify = useToast();
  const { navigateTo } = useNavigation();
  const language = useGqlLanguage();

  const [parentFilter, setParentFilter] = useState<number | undefined>();
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
  } = useRawCommunitySubCategories(parentFilter);
  const { options: parentOptions } = useCommunityCategoryOptions();
  const { upsertCommunitySubCategories, upsertCommunitySubCategoryTranslations } =
    useBlogCommunityMutations();

  const [selected, setSelected] = useState<Map<number, RawCommunitySubCategory>>(
    new Map(),
  );
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState<null | "selected" | "all">(null);

  const toggleRow = (row: RawCommunitySubCategory) =>
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
        sheets: buildCommunitySubCategorySheets(exportRows),
        fileName: `community-subcategories-${fileStamp()}.xlsx`,
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(null);
    }
  };

  const parentLabel = (id: number) =>
    parentOptions.find((o) => o.value === String(id))?.label ?? `#${id}`;

  const columns: Column<RawCommunitySubCategory>[] = [
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
      key: "parent",
      header: t("fields.communityCategory"),
      render: (r) => (
        <Text variant="span" color="secondary">
          {parentLabel(r.communityCategoryId)}
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
      permission="MODERATE_CONTENT"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Title level="h1" size="h3" weight="bold">
              {t("communitySubCategories.title")}
            </Title>
            <Text variant="p" color="secondary">
              {t("communitySubCategories.subtitle")}
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
              onPress={() =>
                navigateTo({ route: catalogPaths.communitySubCategoryNew(lang) })
              }
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            name="search"
            type="search"
            placeholder={t("searchPlaceholder")}
            leftIcon={Search}
            value={search}
            onChangeText={setSearch}
          />
          <Select
            value={parentFilter != null ? String(parentFilter) : ""}
            options={[
              { value: "", label: t("filters.allCommunityCategories") },
              ...parentOptions,
            ]}
            onChangeValue={(v) => {
              setPage(1);
              setParentFilter(v === "" ? undefined : Number(v));
            }}
          />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(r) => String(r.id)}
          emptyLabel={t("communitySubCategories.empty")}
          selection={{
            isRowSelected: (r) => selected.has(r.id),
            onToggleRow: toggleRow,
            allSelected,
            someSelected,
            onToggleAll: toggleAll,
          }}
          onRowClick={(r) =>
            navigateTo({
              route: catalogPaths.communitySubCategoryEdit(lang, r.id),
            })
          }
        />

        <CatalogPagination
          pageInfo={pageInfo}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>

      <BulkImportDialog
        open={importOpen}
        namespace="blogCommunity"
        onClose={() => setImportOpen(false)}
        onImported={() => void refetch()}
        sheets={[
          importSheet({
            sheet: DATA_SHEET,
            map: mapCommunitySubCategoryDataRow,
            commit: (r) => upsertCommunitySubCategories(r, false),
          }),
          importSheet({
            sheet: TRANSLATIONS_SHEET,
            map: mapCommunitySubCategoryTranslationRow,
            commit: (r) => upsertCommunitySubCategoryTranslations(r, false),
          }),
        ]}
      />
    </PermissionGate>
  );
}
