"use client";

import { Download, Plus, Upload } from "lucide-react";
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
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { exportWorkbookToXlsx } from "@/utils/exportXlsx";
import { humanizeEnum } from "@/utils/formatters";
import { plansForKind } from "../constants";
import { useMemberships } from "../hooks/useMemberships";
import { useMembershipBulk } from "../hooks/useMembershipBulk";
import type { Membership, MembershipKind } from "../types";
import {
  buildMembershipSheets,
  mapMembershipDataRow,
  mapMembershipPricingRow,
  mapMembershipTranslationRow,
} from "../xlsx";

function MembershipSection({
  kind,
  lang,
}: {
  kind: MembershipKind;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("memberships");
  const { navigateTo } = useNavigation();
  const notify = useToast();
  const { memberships, loading, refetch } = useMemberships(kind);
  const {
    fetchTranslations,
    fetchPricing,
    upsertData,
    upsertTranslations,
    upsertPricing,
  } = useMembershipBulk(kind);

  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const [translations, pricing] = await Promise.all([
        fetchTranslations(),
        fetchPricing(),
      ]);
      const total = memberships.length + translations.length + pricing.length;
      if (total === 0) {
        notify.info(t("export.nothing"));
        return;
      }
      await exportWorkbookToXlsx({
        sheets: buildMembershipSheets(kind, {
          base: memberships,
          translations,
          pricing,
        }),
        fileName: `memberships-${kind}-${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<Membership>[] = [
    {
      key: "name",
      header: t("table.name"),
      render: (m) => (
        <Text variant="span" weight="semibold">
          {m.translation?.name || humanizeEnum(m.membershipType)}
        </Text>
      ),
    },
    {
      key: "type",
      header: t("table.type"),
      render: (m) => humanizeEnum(m.membershipType),
    },
    {
      key: "duration",
      header: t("table.duration"),
      align: "right",
      render: (m) => m.durationMonths,
    },
    {
      key: "status",
      header: t("table.status"),
      render: (m) => (
        <Badge tone={m.isActive ? "success" : "neutral"}>
          {m.isActive ? t("active") : t("inactive")}
        </Badge>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Title level="h2" size="h5" weight="semibold">
          {t(`kind.${kind}`)}
        </Title>
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
            text={t(`new.${kind}`)}
            leftIcon={Plus}
            size="sm"
            onPress={() => navigateTo({ route: `/${lang}/memberships/${kind}/new` })}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={memberships}
        loading={loading}
        rowKey={(m) => String(m.id)}
        emptyLabel={t("empty")}
        onRowClick={(m) => navigateTo({ route: `/${lang}/memberships/${kind}/${m.id}` })}
      />

      <BulkImportDialog
        open={importOpen}
        namespace="memberships"
        onClose={() => setImportOpen(false)}
        onImported={() => void refetch()}
        sheets={[
          importSheet({
            sheet: "data",
            map: mapMembershipDataRow(plansForKind(kind)),
            commit: upsertData,
          }),
          importSheet({
            sheet: "translations",
            map: mapMembershipTranslationRow(kind),
            commit: upsertTranslations,
          }),
          importSheet({
            sheet: "pricing",
            map: mapMembershipPricingRow(kind),
            commit: upsertPricing,
          }),
        ]}
      />
    </section>
  );
}

export function MembershipsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("memberships");

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-1">
          <Title level="h1" size="h3" weight="bold">
            {t("title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("subtitle")}
          </Text>
        </header>

        <MembershipSection kind="person" lang={lang} />
        <MembershipSection kind="business" lang={lang} />
      </div>
    </PermissionGate>
  );
}
