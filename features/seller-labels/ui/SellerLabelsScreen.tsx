"use client";

import { Plus } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import type { SellerLabel } from "@/types/account";
import { useSellerLabels } from "../hooks/useSellerLabels";

export function SellerLabelsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("sellerLabels");
  const { navigateTo } = useNavigation();
  const { labels, loading } = useSellerLabels();

  const columns: Column<SellerLabel>[] = [
    {
      key: "name",
      header: t("table.name"),
      render: (l) => (
        <Text variant="span" weight="semibold">
          {l.labelName}
        </Text>
      ),
    },
    {
      key: "kind",
      header: t("table.transactionKind"),
      render: (l) => t(`transactionKind.${l.transactionKind}`),
    },
    {
      key: "required",
      header: t("table.required"),
      align: "right",
      render: (l) => l.transactionsRequired,
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
          <MainButton
            text={t("new")}
            leftIcon={Plus}
            size="sm"
            onPress={() => navigateTo({ route: `/${lang}/seller-labels/new` })}
          />
        </header>

        <DataTable
          columns={columns}
          rows={labels}
          loading={loading}
          rowKey={(l) => String(l.id)}
          emptyLabel={t("empty")}
          onRowClick={(l) => navigateTo({ route: `/${lang}/seller-labels/${l.id}` })}
        />
      </div>
    </PermissionGate>
  );
}
