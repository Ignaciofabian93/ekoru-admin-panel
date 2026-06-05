"use client";

import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { FormShell } from "@/components/FormShell/FormShell";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useLocationMutations } from "../hooks/useLocationMutations";
import { locationPaths } from "../paths";
import type { LocationLevel } from "../types";

/** Create / edit a region, city or county (all just a single name + fixed parent). */
export function LocationNodeForm({
  level,
  mode,
  lang,
  countryId,
  regionId,
  cityId,
  nodeId,
  initialName = "",
}: {
  level: LocationLevel;
  mode: "create" | "edit";
  lang: SupportedLanguage;
  countryId: number;
  regionId?: number;
  cityId?: number;
  nodeId?: number;
  initialName?: string;
}) {
  const { t } = useTranslation("locations");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const m = useLocationMutations();
  const [name, setName] = useState(initialName);

  const backHref = () => {
    if (level === "region") return locationPaths.country(lang, countryId);
    if (level === "city") return locationPaths.region(lang, countryId, regionId!);
    return locationPaths.city(lang, countryId, regionId!, cityId!);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = name.trim();
    if (!value) return;

    let ok = false;
    if (level === "region") {
      ok =
        mode === "create"
          ? await m.createRegion({ region: value, countryId })
          : await m.updateRegion(nodeId!, { region: value, countryId });
    } else if (level === "city") {
      ok =
        mode === "create"
          ? await m.createCity({ city: value, regionId: regionId! })
          : await m.updateCity(nodeId!, { city: value, regionId: regionId! });
    } else {
      ok =
        mode === "create"
          ? await m.createCounty({ county: value, cityId: cityId! })
          : await m.updateCounty(nodeId!, { county: value, cityId: cityId! });
    }
    if (ok) navigateTo({ route: backHref() });
  };

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      <FormShell
        backHref={backHref()}
        backLabel={tc("common.back")}
        title={mode === "create" ? t(`createTitle.${level}`) : t(`editTitle.${level}`)}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-border-light bg-surface p-5 shadow-sm"
        >
          <Input
            name="name"
            label={t("fields.name")}
            value={name}
            onChangeText={setName}
            required
          />
          <div className="flex justify-end">
            <MainButton
              text={mode === "create" ? t("actions.create") : t("actions.save")}
              type="submit"
              loading={m.loading}
            />
          </div>
        </form>
      </FormShell>
    </PermissionGate>
  );
}
