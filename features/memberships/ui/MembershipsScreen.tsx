"use client";

import { Plus } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { humanizeEnum } from "@/utils/formatters";
import { useMemberships } from "../hooks/useMemberships";
import type { Membership, MembershipKind } from "../types";

function MembershipSection({
  kind,
  lang,
}: {
  kind: MembershipKind;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("memberships");
  const { navigateTo } = useNavigation();
  const { memberships, loading } = useMemberships(kind);

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
      <div className="flex items-center justify-between">
        <Title level="h2" size="h5" weight="semibold">
          {t(`kind.${kind}`)}
        </Title>
        <MainButton
          text={t(`new.${kind}`)}
          leftIcon={Plus}
          size="sm"
          onPress={() => navigateTo({ route: `/${lang}/memberships/${kind}/new` })}
        />
      </div>
      <DataTable
        columns={columns}
        rows={memberships}
        loading={loading}
        rowKey={(m) => String(m.id)}
        emptyLabel={t("empty")}
        onRowClick={(m) => navigateTo({ route: `/${lang}/memberships/${kind}/${m.id}` })}
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
