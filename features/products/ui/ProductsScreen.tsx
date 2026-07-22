"use client";

import { DatabaseBackup, Download, Plus, Search, Upload } from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { Badge as BadgeChip } from "@/components/Badge/Badge";
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
import { useProductMutations } from "../hooks/useProductMutations";
import { useProductCategoryOptions, useRawProducts } from "../hooks/useRawProducts";
import { productPaths } from "../paths";
import type { RawProduct } from "../types";
import { DATA_SHEET, buildProductSheets, mapProductRow } from "../xlsx";
import { ProductsPagination } from "./ProductsPagination";

type StatusFilter = "all" | "live" | "deleted";
const STATUS_TO_DELETED: Record<StatusFilter, boolean | undefined> = {
  all: undefined,
  live: false,
  deleted: true,
};

export function ProductsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("products");
  const notify = useToast();
  const { navigateTo } = useNavigation();

  const [productCategoryId, setProductCategoryId] = useState<number | undefined>();
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
  } = useRawProducts({
    productCategoryId,
    deleted: STATUS_TO_DELETED[status],
  });
  const { options: categoryOptions } = useProductCategoryOptions();
  const { upsertProducts } = useProductMutations();

  const [selected, setSelected] = useState<Map<number, RawProduct>>(new Map());
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState<null | "selected" | "all">(null);

  const toggleRow = (row: RawProduct) =>
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
        sheets: buildProductSheets(exportRows),
        fileName: `products-${fileStamp()}.xlsx`,
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(null);
    }
  };

  const categoryLabel = (id: number) =>
    categoryOptions.find((o) => o.value === String(id))?.label ?? `#${id}`;

  const statusBadge = (r: RawProduct) => {
    if (r.deletedAt) return <BadgeChip tone="danger">{t("status.deleted")}</BadgeChip>;
    return (
      <BadgeChip tone={r.isActive ? "success" : "neutral"}>
        {r.isActive ? t("status.active") : t("status.inactive")}
      </BadgeChip>
    );
  };

  const columns: Column<RawProduct>[] = [
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
      key: "category",
      header: t("fields.category"),
      render: (r) => (
        <Text variant="span" color="secondary">
          {categoryLabel(r.productCategoryId)}
        </Text>
      ),
    },
    {
      key: "condition",
      header: t("fields.condition"),
      render: (r) => (
        <Text variant="span" color="tertiary">
          {t(`condition.${r.condition}`)}
        </Text>
      ),
    },
    {
      key: "price",
      header: t("fields.price"),
      align: "right",
      render: (r) => (
        <Text variant="span" color="secondary">
          {r.price}
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
              onPress={() => navigateTo({ route: productPaths.new(lang) })}
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
            value={productCategoryId != null ? String(productCategoryId) : ""}
            options={[
              { value: "", label: t("filters.allCategories") },
              ...categoryOptions,
            ]}
            onChangeValue={(v) => {
              setPage(1);
              setProductCategoryId(v === "" ? undefined : Number(v));
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
          onRowClick={(r) => navigateTo({ route: productPaths.edit(lang, r.id) })}
        />

        <ProductsPagination
          pageInfo={pageInfo}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>

      <BulkImportDialog
        open={importOpen}
        namespace="products"
        onClose={() => setImportOpen(false)}
        onImported={() => void refetch()}
        sheets={[
          importSheet({
            sheet: DATA_SHEET,
            map: mapProductRow,
            commit: (r) => upsertProducts(r, false),
          }),
        ]}
      />
    </PermissionGate>
  );
}
