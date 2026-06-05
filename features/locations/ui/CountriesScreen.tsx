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
import type { Country } from "@/types/location";
import { useCountries } from "../hooks/useLocations";
import { locationPaths } from "../paths";

export function CountriesScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("locations");
  const { navigateTo } = useNavigation();
  const { countries, loading } = useCountries();

  const columns: Column<Country>[] = [
    {
      key: "name",
      header: t("fields.name"),
      render: (c) => (
        <Text variant="span" weight="semibold">
          {c.country || "—"}
        </Text>
      ),
    },
    {
      key: "id",
      header: "ID",
      align: "right",
      render: (c) => (
        <Text variant="span" color="tertiary">
          {c.id}
        </Text>
      ),
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
            text={t("actions.newCountry")}
            leftIcon={Plus}
            size="sm"
            onPress={() => navigateTo({ route: locationPaths.countryNew(lang) })}
          />
        </header>

        <DataTable
          columns={columns}
          rows={countries}
          loading={loading}
          rowKey={(c) => String(c.id)}
          emptyLabel={t("empty.countries")}
          onRowClick={(c) => navigateTo({ route: locationPaths.country(lang, c.id) })}
        />
      </div>
    </PermissionGate>
  );
}
