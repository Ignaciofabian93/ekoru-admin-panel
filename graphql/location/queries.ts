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

// ─── Raw admin reads (all rows as stored) for XLSX export ────────────────────
const RAW_LOCATION_PAGE_INFO = gql`
  fragment RawLocationPageInfo on PageInfo {
    currentPage
    totalPages
    totalCount
    hasNextPage
    hasPreviousPage
    pageSize
  }
`;

export const GET_RAW_COUNTRIES = gql`
  ${RAW_LOCATION_PAGE_INFO}
  query RawCountries($page: Int, $pageSize: Int) {
    rawCountries(page: $page, pageSize: $pageSize) {
      nodes {
        id
        code
      }
      pageInfo {
        ...RawLocationPageInfo
      }
    }
  }
`;

export const GET_RAW_COUNTRY_TRANSLATIONS = gql`
  ${RAW_LOCATION_PAGE_INFO}
  query RawCountryTranslations($page: Int, $pageSize: Int) {
    rawCountryTranslations(page: $page, pageSize: $pageSize) {
      nodes {
        id
        countryId
        language
        name
      }
      pageInfo {
        ...RawLocationPageInfo
      }
    }
  }
`;

export const GET_RAW_REGIONS = gql`
  ${RAW_LOCATION_PAGE_INFO}
  query RawRegions($page: Int, $pageSize: Int) {
    rawRegions(page: $page, pageSize: $pageSize) {
      nodes {
        id
        region
        countryId
      }
      pageInfo {
        ...RawLocationPageInfo
      }
    }
  }
`;

export const GET_RAW_CITIES = gql`
  ${RAW_LOCATION_PAGE_INFO}
  query RawCities($page: Int, $pageSize: Int) {
    rawCities(page: $page, pageSize: $pageSize) {
      nodes {
        id
        city
        regionId
      }
      pageInfo {
        ...RawLocationPageInfo
      }
    }
  }
`;

export const GET_RAW_COUNTIES = gql`
  ${RAW_LOCATION_PAGE_INFO}
  query RawCounties($page: Int, $pageSize: Int) {
    rawCounties(page: $page, pageSize: $pageSize) {
      nodes {
        id
        county
        cityId
      }
      pageInfo {
        ...RawLocationPageInfo
      }
    }
  }
`;
