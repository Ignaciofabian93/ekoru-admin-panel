import { type SupportedLanguage } from "@/constants/settings";

// Flat resource-per-level routing. Each link threads the ancestor ids it needs as
// query params, because the backend has no get-by-id queries — every detail/edit
// screen re-fetches through its parent's list query.

const root = (lang: SupportedLanguage) => `/${lang}/locations`;

const qs = (params: Record<string, number | undefined>) => {
  const entries = Object.entries(params).filter(([, v]) => v != null);
  return entries.length ? `?${entries.map(([k, v]) => `${k}=${v}`).join("&")}` : "";
};

export const locationPaths = {
  countries: (lang: SupportedLanguage) => root(lang),

  countryNew: (lang: SupportedLanguage) => `${root(lang)}/countries/new`,
  country: (lang: SupportedLanguage, countryId: number) =>
    `${root(lang)}/countries/${countryId}`,
  countryEdit: (lang: SupportedLanguage, countryId: number) =>
    `${root(lang)}/countries/${countryId}/edit`,

  regionNew: (lang: SupportedLanguage, countryId: number) =>
    `${root(lang)}/regions/new${qs({ countryId })}`,
  region: (lang: SupportedLanguage, countryId: number, regionId: number) =>
    `${root(lang)}/regions/${regionId}${qs({ countryId })}`,
  regionEdit: (lang: SupportedLanguage, countryId: number, regionId: number) =>
    `${root(lang)}/regions/${regionId}/edit${qs({ countryId })}`,

  cityNew: (lang: SupportedLanguage, countryId: number, regionId: number) =>
    `${root(lang)}/cities/new${qs({ countryId, regionId })}`,
  city: (lang: SupportedLanguage, countryId: number, regionId: number, cityId: number) =>
    `${root(lang)}/cities/${cityId}${qs({ countryId, regionId })}`,
  cityEdit: (
    lang: SupportedLanguage,
    countryId: number,
    regionId: number,
    cityId: number,
  ) => `${root(lang)}/cities/${cityId}/edit${qs({ countryId, regionId })}`,

  countyNew: (
    lang: SupportedLanguage,
    countryId: number,
    regionId: number,
    cityId: number,
  ) => `${root(lang)}/counties/new${qs({ countryId, regionId, cityId })}`,
  countyEdit: (
    lang: SupportedLanguage,
    countryId: number,
    regionId: number,
    cityId: number,
    countyId: number,
  ) => `${root(lang)}/counties/${countyId}/edit${qs({ countryId, regionId, cityId })}`,
};
