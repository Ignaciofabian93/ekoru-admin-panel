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
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { exportWorkbookToXlsx } from "@/utils/exportXlsx";
import { useRawProviderCredentials } from "../hooks/useRawProviderCredentials";
import { useProviderCredentialMutations } from "../hooks/useProviderCredentialMutations";
import { providerCredentialPaths } from "../paths";
import type { RawProviderCredentials } from "../types";
import {
  DATA_SHEET,
  buildProviderCredentialSheets,
  mapProviderCredentialRow,
} from "../xlsx";

export function ProviderCredentialsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("providerCredentials");
  const notify = useToast();
  const { navigateTo } = useNavigation();

  const { rows, pageInfo, loading, refetch, fetchAll, search, setSearch, page, setPage } =
    useRawProviderCredentials();
  const { upsert } = useProviderCredentialMutations();

  const [selected, setSelected] = useState<Map<number, RawProviderCredentials>>(
    new Map(),
  );
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState<null | "selected" | "all">(null);

  const toggleRow = (row: RawProviderCredentials) =>
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
        sheets: buildProviderCredentialSheets(exportRows),
        fileName: `provider-credentials-${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(null);
    }
  };

  const columns: Column<RawProviderCredentials>[] = [
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
      key: "sellerId",
      header: t("fields.sellerId"),
      render: (r) => (
        <Text variant="span" weight="semibold">
          {r.sellerId}
        </Text>
      ),
    },
    {
      key: "licenseNumber",
      header: t("fields.licenseNumber"),
      render: (r) => (
        <Text variant="span" color="secondary">
          {r.licenseNumber ?? "—"}
        </Text>
      ),
    },
    {
      key: "isLicenseVerified",
      header: t("fields.isLicenseVerified"),
      align: "center",
      render: (r) => (
        <Badge tone={r.isLicenseVerified ? "success" : "neutral"}>
          {r.isLicenseVerified ? t("status.verified") : t("status.unverified")}
        </Badge>
      ),
    },
    {
      key: "backgroundCheckStatus",
      header: t("fields.backgroundCheckStatus"),
      render: (r) => (
        <Text variant="span" color="secondary">
          {r.backgroundCheckStatus ?? "—"}
        </Text>
      ),
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="VIEW_USER_DATA"
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
              onPress={() => navigateTo({ route: providerCredentialPaths.new(lang) })}
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
            navigateTo({ route: providerCredentialPaths.edit(lang, r.id) })
          }
        />

        {pageInfo && pageInfo.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3">
            <Text variant="small" color="tertiary">
              {t("pagination.summary", {
                current: String(pageInfo.currentPage),
                total: String(pageInfo.totalPages),
                count: String(pageInfo.totalCount),
              })}
            </Text>
            <div className="flex gap-2">
              <MainButton
                text={t("pagination.prev")}
                variant="outline"
                size="sm"
                disabled={!pageInfo.hasPreviousPage}
                onPress={() => setPage(page - 1)}
              />
              <MainButton
                text={t("pagination.next")}
                variant="outline"
                size="sm"
                disabled={!pageInfo.hasNextPage}
                onPress={() => setPage(page + 1)}
              />
            </div>
          </div>
        )}
      </div>

      <BulkImportDialog
        open={importOpen}
        namespace="providerCredentials"
        onClose={() => setImportOpen(false)}
        onImported={() => void refetch()}
        sheets={[
          importSheet({
            sheet: DATA_SHEET,
            map: mapProviderCredentialRow,
            commit: (r) => upsert(r, false),
          }),
        ]}
      />
    </PermissionGate>
  );
}
