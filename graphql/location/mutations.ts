import { gql } from "@apollo/client";

export const CREATE_COUNTRY = gql`
  mutation CreateCountry {
    createCountry(
      input: { translations: { language: ES, name: "Alemania" } }
      language: ES
    ) {
      id
      country
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_REGION = gql`
  mutation CreateRegion {
    createRegion(input: { region: null, countryId: null }, language: ES) {
      id
      region
      countryId
    }
  }
`;

export const CREATE_CITY = gql`
  mutation CreateCity {
    createCity(input: { city: null, regionId: null }, language: ES) {
      id
      city
      regionId
    }
  }
`;

export const CREATE_COUNTY = gql`
  mutation CreateCounty {
    createCounty(input: { county: null, cityId: null }, language: ES) {
      id
      county
      cityId
    }
  }
`;
