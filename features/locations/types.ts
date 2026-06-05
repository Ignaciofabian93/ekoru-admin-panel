import type { City, Country, County, Region } from "@/types/location";
import type { BackendLanguage } from "@/utils/language";

export type CountriesResult = { countries: Country[] };
export type RegionsResult = { regionsByCountryId: Region[] };
export type CitiesResult = { citiesByRegionId: City[] };
export type CountiesResult = { countiesByCityId: County[] };

/** Aliased per-language country lists, used to prefill all country translations. */
export type CountryTranslationsResult = {
  es: Pick<Country, "id" | "country">[];
  en: Pick<Country, "id" | "country">[];
  fr: Pick<Country, "id" | "country">[];
};

export type CountryTranslationInput = { language: BackendLanguage; name: string };
export type CreateCountryInput = { translations: CountryTranslationInput[] };
export type CreateRegionInput = { region: string; countryId: number };
export type CreateCityInput = { city: string; regionId: number };
export type CreateCountyInput = { county: string; cityId: number };

/** The three editable child levels under a country. */
export type LocationLevel = "region" | "city" | "county";
