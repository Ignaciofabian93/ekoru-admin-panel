import { gql } from "@apollo/client";

// All seller level mutations are admin-only. Mirrors AccountResolver in ekoru-users.
export const CREATE_SELLER_LEVEL = gql`
  mutation CreateSellerLevel($input: CreateSellerLevelInput!, $language: Language) {
    createSellerLevel(input: $input, language: $language) {
      id
      levelName
    }
  }
`;

export const UPDATE_SELLER_LEVEL = gql`
  mutation UpdateSellerLevel(
    $id: Int!
    $input: UpdateSellerLevelInput!
    $language: Language
  ) {
    updateSellerLevel(id: $id, input: $input, language: $language) {
      id
      levelName
    }
  }
`;

export const DELETE_SELLER_LEVEL = gql`
  mutation DeleteSellerLevel($id: Int!, $language: Language) {
    deleteSellerLevel(id: $id, language: $language) {
      id
    }
  }
`;

export const UPSERT_SELLER_LEVEL_TRANSLATION = gql`
  mutation UpsertSellerLevelTranslation(
    $input: UpsertSellerLevelTranslationInput!
    $language: Language
  ) {
    upsertSellerLevelTranslation(input: $input, language: $language) {
      id
      sellerLevelId
      language
      levelName
    }
  }
`;

export const DELETE_SELLER_LEVEL_TRANSLATION = gql`
  mutation DeleteSellerLevelTranslation(
    $sellerLevelId: Int!
    $translationLanguage: Language!
    $language: Language
  ) {
    deleteSellerLevelTranslation(
      sellerLevelId: $sellerLevelId
      translationLanguage: $translationLanguage
      language: $language
    ) {
      id
    }
  }
`;
