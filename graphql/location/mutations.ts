import { gql } from "@apollo/client";

// All location mutations are platform-admin only (adminId from context).
// Mirrors the LocationResolver in ekoru-users.

// ─── Countries ────────────────────────────────────────────────────────────────
export const CREATE_COUNTRY = gql`
  mutation CreateCountry($input: CreateCountryInput!, $language: Language) {
    createCountry(input: $input, language: $language) {
      id
      country
      translation {
        id
        countryId
        language
        name
      }
    }
  }
`;

export const UPDATE_COUNTRY = gql`
  mutation UpdateCountry(
    $countryId: Int!
    $input: CreateCountryInput!
    $language: Language
  ) {
    updateCountry(countryId: $countryId, input: $input, language: $language) {
      id
      country
      translation {
        id
        countryId
        language
        name
      }
    }
  }
`;

export const DELETE_COUNTRY = gql`
  mutation DeleteCountry($countryId: Int!, $language: Language) {
    deleteCountry(countryId: $countryId, language: $language) {
      id
    }
  }
`;

// ─── Regions ──────────────────────────────────────────────────────────────────
export const CREATE_REGION = gql`
  mutation CreateRegion($input: CreateRegionInput!, $language: Language) {
    createRegion(input: $input, language: $language) {
      id
      region
      countryId
    }
  }
`;

// NOTE: updateRegion does not exist in ekoru-users yet (to be added by the team,
// mirroring updateCity). Until then this mutation errors at runtime.
export const UPDATE_REGION = gql`
  mutation UpdateRegion(
    $regionId: Int!
    $input: CreateRegionInput!
    $language: Language
  ) {
    updateRegion(regionId: $regionId, input: $input, language: $language) {
      id
      region
      countryId
    }
  }
`;

export const DELETE_REGION = gql`
  mutation DeleteRegion($regionId: Int!, $language: Language) {
    deleteRegion(regionId: $regionId, language: $language) {
      id
    }
  }
`;

// ─── Cities ───────────────────────────────────────────────────────────────────
export const CREATE_CITY = gql`
  mutation CreateCity($input: CreateCityInput!, $language: Language) {
    createCity(input: $input, language: $language) {
      id
      city
      regionId
    }
  }
`;

export const UPDATE_CITY = gql`
  mutation UpdateCity($cityId: Int!, $input: CreateCityInput!, $language: Language) {
    updateCity(cityId: $cityId, input: $input, language: $language) {
      id
      city
      regionId
    }
  }
`;

export const DELETE_CITY = gql`
  mutation DeleteCity($cityId: Int!, $language: Language) {
    deleteCity(cityId: $cityId, language: $language) {
      id
    }
  }
`;

// ─── Counties ─────────────────────────────────────────────────────────────────
export const CREATE_COUNTY = gql`
  mutation CreateCounty($input: CreateCountyInput!, $language: Language) {
    createCounty(input: $input, language: $language) {
      id
      county
      cityId
    }
  }
`;

export const UPDATE_COUNTY = gql`
  mutation UpdateCounty(
    $countyId: Int!
    $input: CreateCountyInput!
    $language: Language
  ) {
    updateCounty(countyId: $countyId, input: $input, language: $language) {
      id
      county
      cityId
    }
  }
`;

export const DELETE_COUNTY = gql`
  mutation DeleteCounty($countyId: Int!, $language: Language) {
    deleteCounty(countyId: $countyId, language: $language) {
      id
    }
  }
`;
