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
import type { City } from "@/types/location";
import { useCities, useRegions } from "../hooks/useLocations";
import { useLocationMutations } from "../hooks/useLocationMutations";
import { locationPaths } from "../paths";

export function RegionDetailScreen({
  countryId,
  regionId,
  lang,
}: {
  countryId: number;
  regionId: number;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("locations");
  const { navigateTo } = useNavigation();
  const { regions } = useRegions(countryId);
  const { cities, loading, refetch } = useCities(regionId);
  const { deleteRegion, deleteCity, loading: mutating } = useLocationMutations();

  const region = regions.find((r) => r.id === regionId);

  const handleDeleteRegion = async () => {
    if (!window.confirm(t("deleteConfirm.region"))) return;
    const ok = await deleteRegion(regionId);
    if (ok) navigateTo({ route: locationPaths.country(lang, countryId) });
  };

  const handleDeleteCity = async (cityId: number) => {
    if (!window.confirm(t("deleteConfirm.city"))) return;
    await deleteCity(cityId);
    refetch();
  };

  const columns: Column<City>[] = [
    {
      key: "name",
      header: t("fields.name"),
      render: (c) => (
        <Text variant="span" weight="semibold">
          {c.city}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton
            icon={Pencil}
            label={t("actions.edit")}
            onClick={() =>
              navigateTo({
                route: locationPaths.cityEdit(lang, countryId, regionId, c.id),
              })
            }
          />
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("actions.delete")}
            disabled={mutating}
            onClick={() => handleDeleteCity(c.id)}
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
        backHref={locationPaths.country(lang, countryId)}
        backLabel={t("back.country")}
        title={region?.region || `#${regionId}`}
        subtitle={t("regions")}
        actions={
          <div className="flex gap-2">
            <MainButton
              text={t("actions.edit")}
              variant="secondary_outline"
              size="sm"
              leftIcon={Pencil}
              onPress={() =>
                navigateTo({ route: locationPaths.regionEdit(lang, countryId, regionId) })
              }
            />
            <MainButton
              text={t("actions.delete")}
              variant="error"
              size="sm"
              leftIcon={Trash2}
              loading={mutating}
              onPress={handleDeleteRegion}
            />
          </div>
        }
      >
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Title level="h2" size="h6" weight="semibold">
              {t("cities")}
            </Title>
            <MainButton
              text={t("actions.newCity")}
              leftIcon={Plus}
              size="sm"
              onPress={() =>
                navigateTo({ route: locationPaths.cityNew(lang, countryId, regionId) })
              }
            />
          </div>
          <DataTable
            columns={columns}
            rows={cities}
            loading={loading}
            rowKey={(c) => String(c.id)}
            emptyLabel={t("empty.cities")}
            onRowClick={(c) =>
              navigateTo({ route: locationPaths.city(lang, countryId, regionId, c.id) })
            }
          />
        </section>
      </FormShell>
    </PermissionGate>
  );
}
