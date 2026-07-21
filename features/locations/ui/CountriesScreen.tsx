"use client";

import { Download, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
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
import type { Country } from "@/types/location";
import { exportWorkbookToXlsx } from "@/utils/exportXlsx";
import { useCountries } from "../hooks/useLocations";
import { useLocationCatalog } from "../hooks/useLocationCatalog";
import { locationPaths } from "../paths";
import {
  buildLocationSheets,
  mapCityRow,
  mapCountryRow,
  mapCountryTranslationRow,
  mapCountyRow,
  mapRegionRow,
  SHEETS,
} from "../xlsx";

export function CountriesScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("locations");
  const { navigateTo } = useNavigation();
  const notify = useToast();
  const { countries, loading, refetch } = useCountries();
  const {
    fetchAll,
    upsertCountries,
    upsertCountryTranslations,
    upsertRegions,
    upsertCities,
    upsertCounties,
  } = useLocationCatalog();

  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await fetchAll();
      const total =
        data.countries.length +
        data.countryTranslations.length +
        data.regions.length +
        data.cities.length +
        data.counties.length;
      if (total === 0) {
        notify.info(t("export.nothing"));
        return;
      }
      await exportWorkbookToXlsx({
        sheets: buildLocationSheets(data),
        fileName: `locations-${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
    } catch {
      notify.error(t("export.failed"));
    } finally {
      setExporting(false);
    }
  };

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
              text={t("actions.newCountry")}
              leftIcon={Plus}
              size="sm"
              onPress={() => navigateTo({ route: locationPaths.countryNew(lang) })}
            />
          </div>
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

      <BulkImportDialog
        open={importOpen}
        namespace="locations"
        onClose={() => setImportOpen(false)}
        onImported={() => void refetch()}
        sheets={[
          importSheet({
            sheet: SHEETS.countries,
            map: mapCountryRow,
            commit: upsertCountries,
          }),
          importSheet({
            sheet: SHEETS.countryTranslations,
            map: mapCountryTranslationRow,
            commit: upsertCountryTranslations,
          }),
          importSheet({
            sheet: SHEETS.regions,
            map: mapRegionRow,
            commit: upsertRegions,
          }),
          importSheet({
            sheet: SHEETS.cities,
            map: mapCityRow,
            commit: upsertCities,
          }),
          importSheet({
            sheet: SHEETS.counties,
            map: mapCountyRow,
            commit: upsertCounties,
          }),
        ]}
      />
    </PermissionGate>
  );
}
