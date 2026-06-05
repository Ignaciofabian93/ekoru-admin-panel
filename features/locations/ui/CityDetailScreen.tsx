"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { FormShell } from "@/components/FormShell/FormShell";
import { IconButton } from "@/components/IconButton/IconButton";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import type { County } from "@/types/location";
import { useCities, useCounties } from "../hooks/useLocations";
import { useLocationMutations } from "../hooks/useLocationMutations";
import { locationPaths } from "../paths";

export function CityDetailScreen({
  countryId,
  regionId,
  cityId,
  lang,
}: {
  countryId: number;
  regionId: number;
  cityId: number;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("locations");
  const { navigateTo } = useNavigation();
  const { cities } = useCities(regionId);
  const { counties, loading, refetch } = useCounties(cityId);
  const { deleteCity, deleteCounty, loading: mutating } = useLocationMutations();

  const city = cities.find((c) => c.id === cityId);

  const handleDeleteCity = async () => {
    if (!window.confirm(t("deleteConfirm.city"))) return;
    const ok = await deleteCity(cityId);
    if (ok) navigateTo({ route: locationPaths.region(lang, countryId, regionId) });
  };

  const handleDeleteCounty = async (countyId: number) => {
    if (!window.confirm(t("deleteConfirm.county"))) return;
    await deleteCounty(countyId);
    refetch();
  };

  const columns: Column<County>[] = [
    {
      key: "name",
      header: t("fields.name"),
      render: (c) => (
        <Text variant="span" weight="semibold">
          {c.county}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <IconButton
            icon={Pencil}
            label={t("actions.edit")}
            onClick={() =>
              navigateTo({
                route: locationPaths.countyEdit(lang, countryId, regionId, cityId, c.id),
              })
            }
          />
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("actions.delete")}
            disabled={mutating}
            onClick={() => handleDeleteCounty(c.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      <FormShell
        backHref={locationPaths.region(lang, countryId, regionId)}
        backLabel={t("back.region")}
        title={city?.city || `#${cityId}`}
        subtitle={t("cities")}
        actions={
          <div className="flex gap-2">
            <MainButton
              text={t("actions.edit")}
              variant="secondary_outline"
              size="sm"
              leftIcon={Pencil}
              onPress={() =>
                navigateTo({
                  route: locationPaths.cityEdit(lang, countryId, regionId, cityId),
                })
              }
            />
            <MainButton
              text={t("actions.delete")}
              variant="error"
              size="sm"
              leftIcon={Trash2}
              loading={mutating}
              onPress={handleDeleteCity}
            />
          </div>
        }
      >
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Title level="h2" size="h6" weight="semibold">
              {t("counties")}
            </Title>
            <MainButton
              text={t("actions.newCounty")}
              leftIcon={Plus}
              size="sm"
              onPress={() =>
                navigateTo({
                  route: locationPaths.countyNew(lang, countryId, regionId, cityId),
                })
              }
            />
          </div>
          <DataTable
            columns={columns}
            rows={counties}
            loading={loading}
            rowKey={(c) => String(c.id)}
            emptyLabel={t("empty.counties")}
          />
        </section>
      </FormShell>
    </PermissionGate>
  );
}
