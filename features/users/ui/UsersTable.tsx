"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { Text } from "@/components/Text/Text";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import type { Seller } from "@/types/user";
import { sellerDisplayName } from "../types";
import { SellerStatusBadges } from "./SellerStatusBadges";

export function UsersTable({
  sellers,
  loading,
  lang,
}: {
  sellers: Seller[];
  loading: boolean;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("users");
  const { navigateTo } = useNavigation();

  const columns: Column<Seller>[] = [
    {
      key: "name",
      header: t("table.name"),
      render: (s) => (
        <Text variant="span" weight="semibold">
          {sellerDisplayName(s)}
        </Text>
      ),
    },
    {
      key: "email",
      header: t("table.email"),
      render: (s) => (
        <Text variant="span" color="secondary">
          {s.email}
        </Text>
      ),
    },
    {
      key: "type",
      header: t("table.type"),
      render: (s) => t(`sellerType.${s.sellerType}`),
    },
    {
      key: "status",
      header: t("table.status"),
      render: (s) => <SellerStatusBadges seller={s} />,
    },
    {
      key: "points",
      header: t("table.points"),
      align: "right",
      render: (s) => s.points ?? 0,
    },
    {
      key: "joined",
      header: t("table.joined"),
      render: (s) => formatDate(s.createdAt, lang),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={sellers}
      loading={loading}
      rowKey={(s) => s.id}
      onRowClick={(s) => navigateTo({ route: `/${lang}/users/${s.id}` })}
    />
  );
}
