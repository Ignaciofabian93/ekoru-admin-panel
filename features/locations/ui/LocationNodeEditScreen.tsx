"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import { useCities, useCounties, useRegions } from "../hooks/useLocations";
import { LocationNodeForm } from "./LocationNodeForm";
import type { LocationLevel } from "../types";

/**
 * Resolves a region/city/county's current name (via its parent's list query, since
 * the backend has no get-by-id) and hands it to the edit form.
 */
export function LocationNodeEditScreen({
  level,
  lang,
  countryId,
  regionId,
  cityId,
  nodeId,
}: {
  level: LocationLevel;
  lang: SupportedLanguage;
  countryId: number;
  regionId?: number;
  cityId?: number;
  nodeId: number;
}) {
  const { t } = useTranslation("locations");
  const { t: tc } = useTranslation();

  const { regions, loading: rl } = useRegions(level === "region" ? countryId : undefined);
  const { cities, loading: cl } = useCities(level === "city" ? regionId : undefined);
  const { counties, loading: col } = useCounties(level === "county" ? cityId : undefined);
  const loading = rl || cl || col;

  const name =
    level === "region"
      ? regions.find((r) => r.id === nodeId)?.region
      : level === "city"
        ? cities.find((c) => c.id === nodeId)?.city
        : counties.find((c) => c.id === nodeId)?.county;

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {tc("common.loading")}
        </Text>
      </div>
    );
  }

  if (name == null) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {t("notFound")}
        </Text>
      </div>
    );
  }

  return (
    <LocationNodeForm
      level={level}
      mode="edit"
      lang={lang}
      countryId={countryId}
      regionId={regionId}
      cityId={cityId}
      nodeId={nodeId}
      initialName={name}
    />
  );
}
