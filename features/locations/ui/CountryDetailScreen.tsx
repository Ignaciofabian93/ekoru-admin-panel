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
import type { Region } from "@/types/location";
import { useCountries, useRegions } from "../hooks/useLocations";
import { useLocationMutations } from "../hooks/useLocationMutations";
import { locationPaths } from "../paths";

export function CountryDetailScreen({
  countryId,
  lang,
}: {
  countryId: number;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("locations");
  const { navigateTo } = useNavigation();
  const { countries } = useCountries();
  const { regions, loading, refetch } = useRegions(countryId);
  const { deleteCountry, deleteRegion, loading: mutating } = useLocationMutations();

  const country = countries.find((c) => c.id === countryId);

  const handleDeleteCountry = async () => {
    if (!window.confirm(t("deleteConfirm.country"))) return;
    const ok = await deleteCountry(countryId);
    if (ok) navigateTo({ route: locationPaths.countries(lang) });
  };

  const handleDeleteRegion = async (regionId: number) => {
    if (!window.confirm(t("deleteConfirm.region"))) return;
    await deleteRegion(regionId);
    refetch();
  };

  const columns: Column<Region>[] = [
    {
      key: "name",
      header: t("fields.name"),
      render: (r) => (
        <Text variant="span" weight="semibold">
          {r.region}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton
            icon={Pencil}
            label={t("actions.edit")}
            onClick={() =>
              navigateTo({ route: locationPaths.regionEdit(lang, countryId, r.id) })
            }
          />
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("actions.delete")}
            disabled={mutating}
            onClick={() => handleDeleteRegion(r.id)}
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
        backHref={locationPaths.countries(lang)}
        backLabel={t("back.countries")}
        title={country?.country || `#${countryId}`}
        subtitle={t("countries")}
        actions={
          <div className="flex gap-2">
            <MainButton
              text={t("actions.edit")}
              variant="secondary_outline"
              size="sm"
              leftIcon={Pencil}
              onPress={() =>
                navigateTo({ route: locationPaths.countryEdit(lang, countryId) })
              }
            />
            <MainButton
              text={t("actions.delete")}
              variant="error"
              size="sm"
              leftIcon={Trash2}
              loading={mutating}
              onPress={handleDeleteCountry}
            />
          </div>
        }
      >
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Title level="h2" size="h6" weight="semibold">
              {t("regions")}
            </Title>
            <MainButton
              text={t("actions.newRegion")}
              leftIcon={Plus}
              size="sm"
              onPress={() =>
                navigateTo({ route: locationPaths.regionNew(lang, countryId) })
              }
            />
          </div>
          <DataTable
            columns={columns}
            rows={regions}
            loading={loading}
            rowKey={(r) => String(r.id)}
            emptyLabel={t("empty.regions")}
            onRowClick={(r) =>
              navigateTo({ route: locationPaths.region(lang, countryId, r.id) })
            }
          />
        </section>
      </FormShell>
    </PermissionGate>
  );
}
