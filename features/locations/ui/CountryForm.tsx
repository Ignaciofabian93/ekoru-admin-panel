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
import { BACKEND_LANGUAGES, type BackendLanguage } from "@/utils/language";
import { useLocationMutations } from "../hooks/useLocationMutations";
import { locationPaths } from "../paths";

type Names = Record<BackendLanguage, string>;
const EMPTY_NAMES: Names = { ES: "", EN: "", FR: "" };

export function CountryForm({
  mode,
  lang,
  countryId,
  initialNames,
}: {
  mode: "create" | "edit";
  lang: SupportedLanguage;
  countryId?: number;
  initialNames?: Names;
}) {
  const { t } = useTranslation("locations");
  const { navigateTo } = useNavigation();
  const { createCountry, updateCountry, loading } = useLocationMutations();
  const [names, setNames] = useState<Names>(initialNames ?? EMPTY_NAMES);

  const setName = (l: BackendLanguage, v: string) =>
    setNames((prev) => ({ ...prev, [l]: v }));

  const backHref =
    mode === "edit" && countryId != null
      ? locationPaths.country(lang, countryId)
      : locationPaths.countries(lang);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const translations = BACKEND_LANGUAGES.filter((l) => names[l].trim()).map((l) => ({
      language: l,
      name: names[l].trim(),
    }));
    if (!translations.length) return;

    if (mode === "create") {
      const ok = await createCountry({ translations });
      if (ok) navigateTo({ route: locationPaths.countries(lang) });
    } else if (countryId != null) {
      const ok = await updateCountry(countryId, { translations });
      if (ok) navigateTo({ route: locationPaths.country(lang, countryId) });
    }
  };

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      <FormShell
        backHref={backHref}
        backLabel={t("back.countries")}
        title={mode === "create" ? t("createTitle.country") : t("editTitle.country")}
        subtitle={t("translationsHint")}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-border-light bg-surface p-5 shadow-sm"
        >
          {BACKEND_LANGUAGES.map((l) => (
            <Input
              key={l}
              name={`name-${l}`}
              label={t(`language.${l}`)}
              value={names[l]}
              onChangeText={(v) => setName(l, v)}
            />
          ))}
          <div className="flex justify-end">
            <MainButton
              text={mode === "create" ? t("actions.create") : t("actions.save")}
              type="submit"
              loading={loading}
            />
          </div>
        </form>
      </FormShell>
    </PermissionGate>
  );
}
