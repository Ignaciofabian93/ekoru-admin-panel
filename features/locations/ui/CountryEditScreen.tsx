"use client";

import { useQuery } from "@apollo/client/react";
import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import { GET_COUNTRY_TRANSLATIONS } from "@/graphql/location/queries";
import { useTranslation } from "@/i18n/context";
import type { BackendLanguage } from "@/utils/language";
import type { CountryTranslationsResult } from "../types";
import { CountryForm } from "./CountryForm";

export function CountryEditScreen({ id, lang }: { id: number; lang: SupportedLanguage }) {
  const { t } = useTranslation("locations");
  const { t: tc } = useTranslation();
  const { data, loading } = useQuery<CountryTranslationsResult>(GET_COUNTRY_TRANSLATIONS);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {tc("common.loading")}
        </Text>
      </div>
    );
  }

  const exists =
    data &&
    (data.es.some((c) => c.id === id) ||
      data.en.some((c) => c.id === id) ||
      data.fr.some((c) => c.id === id));

  if (!exists) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {t("notFound")}
        </Text>
      </div>
    );
  }

  const initialNames: Record<BackendLanguage, string> = {
    ES: data?.es.find((c) => c.id === id)?.country ?? "",
    EN: data?.en.find((c) => c.id === id)?.country ?? "",
    FR: data?.fr.find((c) => c.id === id)?.country ?? "",
  };

  return (
    <CountryForm mode="edit" lang={lang} countryId={id} initialNames={initialNames} />
  );
}
