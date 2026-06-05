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
import type { SellerLevel } from "@/types/account";
import { useSellerLevels } from "../hooks/useSellerLevels";

export function SellerLevelsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("sellerLevels");
  const { navigateTo } = useNavigation();
  const { levels, loading } = useSellerLevels();

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
          <MainButton
            text={t("new")}
            leftIcon={Plus}
            size="sm"
            onPress={() => navigateTo({ route: `/${lang}/seller-levels/new` })}
          />
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
    </PermissionGate>
  );
}
