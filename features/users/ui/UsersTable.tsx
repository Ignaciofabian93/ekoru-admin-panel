"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { Badge } from "@/components/Badge/Badge";
import {
  DataTable,
  type Column,
  type TableSelection,
} from "@/components/DataTable/DataTable";
import { Text } from "@/components/Text/Text";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import type { Seller } from "@/types/user";
import { sellerDisplayName } from "../types";

export function UsersTable({
  sellers,
  loading,
  lang,
  selection,
}: {
  sellers: Seller[];
  loading: boolean;
  lang: SupportedLanguage;
  selection?: TableSelection<Seller>;
}) {
  const { t } = useTranslation("users");
  const { t: tc } = useTranslation();
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
      render: (s) => (
        <Badge tone={s.isActive ? "success" : "danger"}>
          {s.isActive ? tc("common.active") : tc("common.inactive")}
        </Badge>
      ),
    },
    {
      key: "verified",
      header: t("table.verified"),
      render: (s) => (
        <Badge tone={s.isVerified ? "info" : "neutral"}>
          {s.isVerified ? tc("common.verified") : tc("common.unverified")}
        </Badge>
      ),
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
      selection={selection}
      onRowClick={(s) => navigateTo({ route: `/${lang}/users/${s.id}` })}
    />
  );
}
