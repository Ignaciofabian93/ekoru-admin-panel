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
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { exportWorkbookToXlsx } from "@/utils/exportXlsx";
import { useStoreProductMutations } from "../hooks/useStoreProductMutations";
import {
  useRawStoreProducts,
  useStoreSubCategoryOptions,
} from "../hooks/useRawStoreProducts";
import { storeProductPaths } from "../paths";
import type { RawStoreProduct } from "../types";
import { DATA_SHEET, buildStoreProductSheets, mapStoreProductRow } from "../xlsx";
import { StoreProductsPagination } from "./StoreProductsPagination";

type StatusFilter = "all" | "live" | "deleted";
const STATUS_TO_DELETED: Record<StatusFilter, boolean | undefined> = {
  all: undefined,
  live: false,
  deleted: true,
};

export function StoreProductsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("storeProducts");
  const notify = useToast();
  const { navigateTo } = useNavigation();

  const [subCategoryId, setSubCategoryId] = useState<number | undefined>();
  const [status, setStatus] = useState<StatusFilter>("all");
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
  } = useRawStoreProducts({ subCategoryId, deleted: STATUS_TO_DELETED[status] });
  const { options: subCategoryOptions } = useStoreSubCategoryOptions();
  const { upsertStoreProducts } = useStoreProductMutations();

  const [selected, setSelected] = useState<Map<number, RawStoreProduct>>(new Map());
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState<null | "selected" | "all">(null);

  const toggleRow = (row: RawStoreProduct) =>
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
        sheets: buildStoreProductSheets(exportRows),
        fileName: `store-products-${fileStamp()}.xlsx`,
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(null);
    }
  };

  const parentLabel = (id: number) =>
    subCategoryOptions.find((o) => o.value === String(id))?.label ?? `#${id}`;

  const statusBadge = (r: RawStoreProduct) => {
    if (r.deletedAt) return <Badge tone="danger">{t("status.deleted")}</Badge>;
    return (
      <Badge tone={r.isActive ? "success" : "neutral"}>
        {r.isActive ? t("status.active") : t("status.inactive")}
      </Badge>
    );
  };

  const columns: Column<RawStoreProduct>[] = [
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
          {r.name}
        </Text>
      ),
    },
    {
      key: "subCategory",
      header: t("fields.subCategory"),
      render: (r) => (
        <Text variant="span" color="secondary">
          {parentLabel(r.subCategoryId)}
        </Text>
      ),
    },
    {
      key: "price",
      header: t("fields.price"),
      align: "right",
      render: (r) => (
        <Text variant="span" color="secondary">
          {r.hasOffer && r.offerPrice != null ? `${r.offerPrice} (${r.price})` : r.price}
        </Text>
      ),
    },
    {
      key: "stock",
      header: t("fields.stock"),
      align: "right",
      render: (r) => (
        <Text variant="span" color={r.isLowStock ? "error" : "tertiary"}>
          {r.stock}
        </Text>
      ),
    },
    {
      key: "status",
      header: t("sections.status"),
      align: "center",
      render: statusBadge,
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_PRODUCTS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
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
              onPress={() => navigateTo({ route: storeProductPaths.new(lang) })}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            name="search"
            type="search"
            placeholder={t("searchPlaceholder")}
            leftIcon={Search}
            value={search}
            onChangeText={setSearch}
          />
          <Select
            value={subCategoryId != null ? String(subCategoryId) : ""}
            options={[
              { value: "", label: t("filters.allSubCategories") },
              ...subCategoryOptions,
            ]}
            onChangeValue={(v) => {
              setPage(1);
              setSubCategoryId(v === "" ? undefined : Number(v));
            }}
          />
          <Select
            value={status}
            options={[
              { value: "all", label: t("filters.status.all") },
              { value: "live", label: t("filters.status.live") },
              { value: "deleted", label: t("filters.status.deleted") },
            ]}
            onChangeValue={(v) => {
              setPage(1);
              setStatus(v as StatusFilter);
            }}
          />
        </div>

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
          onRowClick={(r) => navigateTo({ route: storeProductPaths.edit(lang, r.id) })}
        />

        <StoreProductsPagination
          pageInfo={pageInfo}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>

      <BulkImportDialog
        open={importOpen}
        namespace="storeProducts"
        onClose={() => setImportOpen(false)}
        onImported={() => void refetch()}
        sheets={[
          importSheet({
            sheet: DATA_SHEET,
            map: mapStoreProductRow,
            commit: (r) => upsertStoreProducts(r, false),
          }),
        ]}
      />
    </PermissionGate>
  );
}
