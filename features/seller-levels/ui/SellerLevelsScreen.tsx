"use client";

import { Download, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import {
  BulkImportDialog,
  importSheet,
} from "@/components/BulkImportDialog/BulkImportDialog";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { SellerLevel } from "@/types/account";
import { exportWorkbookToXlsx } from "@/utils/exportXlsx";
import { useSellerLevels } from "../hooks/useSellerLevels";
import { useSellerLevelBulk } from "../hooks/useSellerLevelBulk";
import {
  buildSellerLevelSheets,
  mapSellerLevelDataRow,
  mapSellerLevelTranslationRow,
} from "../xlsx";

export function SellerLevelsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("sellerLevels");
  const { navigateTo } = useNavigation();
  const notify = useToast();
  const { levels, loading, refetch } = useSellerLevels();
  const { upsertData, upsertTranslations } = useSellerLevelBulk();

  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (levels.length === 0) {
      notify.info(t("export.nothing"));
      return;
    }
    setExporting(true);
    try {
      await exportWorkbookToXlsx({
        sheets: buildSellerLevelSheets(levels),
        fileName: `seller-levels-${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<SellerLevel>[] = [
    {
      key: "name",
      header: t("table.name"),
      render: (l) => (
        <Text variant="span" weight="semibold">
          {l.levelName}
        </Text>
      ),
    },
    {
      key: "min",
      header: t("table.minPoints"),
      align: "right",
      render: (l) => l.minPoints,
    },
    {
      key: "max",
      header: t("table.maxPoints"),
      align: "right",
      render: (l) => l.maxPoints ?? "—",
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
              text={t("actions.export")}
              leftIcon={Download}
              variant="secondary_outline"
              size="sm"
              loading={exporting}
              onPress={handleExport}
            />
            <MainButton
              text={t("new")}
              leftIcon={Plus}
              size="sm"
              onPress={() => navigateTo({ route: `/${lang}/seller-levels/new` })}
            />
          </div>
        </header>

        <DataTable
          columns={columns}
          rows={levels}
          loading={loading}
          rowKey={(l) => String(l.id)}
          emptyLabel={t("empty")}
          onRowClick={(l) => navigateTo({ route: `/${lang}/seller-levels/${l.id}` })}
        />
      </div>

      <BulkImportDialog
        open={importOpen}
        namespace="sellerLevels"
        onClose={() => setImportOpen(false)}
        onImported={() => void refetch()}
        sheets={[
          importSheet({
            sheet: "data",
            map: mapSellerLevelDataRow,
            commit: upsertData,
          }),
          importSheet({
            sheet: "translations",
            map: mapSellerLevelTranslationRow,
            commit: upsertTranslations,
          }),
        ]}
      />
    </PermissionGate>
  );
}
