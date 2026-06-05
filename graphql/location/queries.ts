import { gql } from "@apollo/client";

// Location reads. NOTE: in ekoru-users these queries are seller-gated
// (@CurrentSeller) and only return the active-language name; mutations are
// admin-gated. Platform admins need the gateway to authorize sellerless reads.
export const GET_COUNTRIES = gql`
  query Countries($language: Language) {
    countries(language: $language) {
      id
      country
      createdAt
      updatedAt
    }
  }
`;

// `countries` returns only one translation (the active language) and updateCountry
// REPLACES the whole set, so the edit form needs every language. Gather them via
// per-language aliases.
export const GET_COUNTRY_TRANSLATIONS = gql`
  query CountryTranslations {
    es: countries(language: ES) {
      id
      country
    }
    en: countries(language: EN) {
      id
      country
    }
    fr: countries(language: FR) {
      id
      country
    }
  }
`;

export const GET_REGIONS = gql`
  query RegionsByCountryId($countryId: Int!, $language: Language) {
    regionsByCountryId(countryId: $countryId, language: $language) {
      id
      region
      countryId
    }
  }
`;

export const GET_CITIES = gql`
  query CitiesByRegionId($regionId: Int!, $language: Language) {
    citiesByRegionId(regionId: $regionId, language: $language) {
      id
      city
      regionId
    }
  }
`;

export const GET_COUNTIES = gql`
  query CountiesByCityId($cityId: Int!, $language: Language) {
    countiesByCityId(cityId: $cityId, language: $language) {
      id
      county
      cityId
    }
  }
`;
