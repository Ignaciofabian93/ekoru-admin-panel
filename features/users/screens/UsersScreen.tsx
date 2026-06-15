"use client";

import {
  ChevronLeft,
  ChevronRight,
  DatabaseBackup,
  Download,
  Search,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Select } from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { SellerType } from "@/types/enums";
import type { Seller } from "@/types/user";
import { exportToXlsx } from "@/utils/exportXlsx";
import { buildSellerExportColumns } from "../export";
import { PAGE_SIZE_OPTIONS, useSellers } from "../hooks/useSellers";
import { ImportSellersDialog } from "../ui/ImportSellersDialog";
import { SellerDetailModal } from "../ui/SellerDetailModal";
import { UsersTable } from "../ui/UsersTable";

const SELLER_TYPES: SellerType[] = ["PERSON", "STARTUP", "COMPANY"];

export function UsersList({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("users");
  const { t: tc } = useTranslation();
  const notify = useToast();
  const {
    sellers,
    pageInfo,
    loading,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    fetchAll,
    refetch,
  } = useSellers();

  // Selected rows are keyed by id and keep the full Seller, so a selection made
  // on one page survives pagination and can be exported wholesale.
  const [selected, setSelected] = useState<Map<string, Seller>>(new Map());
  const [importOpen, setImportOpen] = useState(false);
  // Row clicked open in the detail modal (null = closed).
  const [activeSeller, setActiveSeller] = useState<Seller | null>(null);
  // Which export action is currently running (so only that button spins).
  const [exporting, setExporting] = useState<null | "selected" | "all">(null);

  const typeOptions = [
    { value: "", label: t("filters.all") },
    ...SELLER_TYPES.map((v) => ({ value: v, label: t(`sellerType.${v}`) })),
  ];
  const statusOptions = [
    { value: "all", label: t("filters.all") },
    { value: "active", label: t("filters.active") },
    { value: "inactive", label: t("filters.inactive") },
  ];
  const verifiedOptions = [
    { value: "all", label: t("filters.all") },
    { value: "yes", label: t("filters.isVerified") },
    { value: "no", label: t("filters.notVerified") },
  ];
  const statusValue =
    filters.isActive === undefined ? "all" : filters.isActive ? "active" : "inactive";
  const verifiedValue =
    filters.isVerified === undefined ? "all" : filters.isVerified ? "yes" : "no";

  const toggleRow = (s: Seller) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(s.id)) next.delete(s.id);
      else next.set(s.id, s);
      return next;
    });
  const allSelected = sellers.length > 0 && sellers.every((s) => selected.has(s.id));
  const someSelected = sellers.some((s) => selected.has(s.id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (allSelected) sellers.forEach((s) => next.delete(s.id));
      else sellers.forEach((s) => next.set(s.id, s));
      return next;
    });

  const fileStamp = () => new Date().toISOString().slice(0, 10);

  const handleExportSelected = async () => {
    const rows = [...selected.values()];
    if (rows.length === 0) {
      notify.info(t("export.nothing"));
      return;
    }
    setExporting("selected");
    try {
      await exportToXlsx({
        rows,
        columns: buildSellerExportColumns(t, tc, lang),
        fileName: `sellers-${fileStamp()}.xlsx`,
        sheetName: t("title"),
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(null);
    }
  };

  const handleExportAll = async () => {
    setExporting("all");
    try {
      const all = await fetchAll();
      if (all.length === 0) {
        notify.info(t("export.nothing"));
        return;
      }
      await exportToXlsx({
        rows: all,
        columns: buildSellerExportColumns(t, tc, lang),
        fileName: `sellers-backup-${fileStamp()}.xlsx`,
        sheetName: t("title"),
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(null);
    }
  };

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_USERS"
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
              loading={exporting === "selected"}
              disabled={selected.size === 0 || exporting !== null}
              onPress={handleExportSelected}
            />
            <MainButton
              text={t("actions.exportAll")}
              leftIcon={DatabaseBackup}
              variant="secondary_outline"
              size="sm"
              loading={exporting === "all"}
              disabled={exporting !== null}
              onPress={handleExportAll}
            />
          </div>
        </header>

        <div className="flex flex-col gap-3">
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              label={t("filters.sellerType")}
              value={filters.sellerType ?? ""}
              options={typeOptions}
              onChangeValue={(v) =>
                setFilters({
                  ...filters,
                  sellerType: (v || undefined) as SellerType | undefined,
                })
              }
            />
            <Select
              label={t("filters.status")}
              value={statusValue}
              options={statusOptions}
              onChangeValue={(v) =>
                setFilters({
                  ...filters,
                  isActive: v === "all" ? undefined : v === "active",
                })
              }
            />
            <Select
              label={t("filters.verified")}
              value={verifiedValue}
              options={verifiedOptions}
              onChangeValue={(v) =>
                setFilters({
                  ...filters,
                  isVerified: v === "all" ? undefined : v === "yes",
                })
              }
            />
          </div>
        </div>

        <UsersTable
          sellers={sellers}
          loading={loading}
          lang={lang}
          selection={{
            isRowSelected: (s) => selected.has(s.id),
            onToggleRow: toggleRow,
            allSelected,
            someSelected,
            onToggleAll: toggleAll,
          }}
          onRowClick={setActiveSeller}
        />

        {pageInfo && pageInfo.totalCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <Text variant="small" color="tertiary">
                {t("pagination.summary", {
                  current: String(pageInfo.currentPage),
                  total: String(pageInfo.totalPages),
                  count: String(pageInfo.totalCount),
                })}
              </Text>
              <div className="flex items-center gap-2">
                <Text variant="small" color="tertiary">
                  {t("pagination.rowsPerPage")}
                </Text>
                <div className="w-20">
                  <Select
                    value={String(pageSize)}
                    options={PAGE_SIZE_OPTIONS.map((n) => ({
                      value: String(n),
                      label: String(n),
                    }))}
                    onChangeValue={(v) => setPageSize(Number(v))}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <MainButton
                text={t("pagination.prev")}
                variant="outline"
                size="sm"
                leftIcon={ChevronLeft}
                disabled={!pageInfo.hasPreviousPage}
                onPress={() => setPage(page - 1)}
              />
              <MainButton
                text={t("pagination.next")}
                variant="outline"
                size="sm"
                rightIcon={ChevronRight}
                disabled={!pageInfo.hasNextPage}
                onPress={() => setPage(page + 1)}
              />
            </div>
          </div>
        )}
      </div>

      <ImportSellersDialog open={importOpen} onClose={() => setImportOpen(false)} />

      {activeSeller && (
        <SellerDetailModal
          key={activeSeller.id}
          seller={activeSeller}
          lang={lang}
          onClose={() => setActiveSeller(null)}
          onRefetch={() => {
            void refetch();
          }}
        />
      )}
    </PermissionGate>
  );
}
