import { gql } from "@apollo/client";

export const GET_COUNTRIES = gql`
  query Countries {
    countries(language: ES) {
      id
      country
      createdAt
      updatedAt
      translation {
        id
        countryId
        language
        name
      }
    }
  }
`;
