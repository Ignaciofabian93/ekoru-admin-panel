import { gql } from "@apollo/client";

// All seller label mutations are admin-only. Mirrors AccountResolver in ekoru-users.
export const CREATE_SELLER_LABEL = gql`
  mutation CreateSellerLabel($input: CreateSellerLabelInput!, $language: Language) {
    createSellerLabel(input: $input, language: $language) {
      id
      labelName
    }
  }
`;

export const UPDATE_SELLER_LABEL = gql`
  mutation UpdateSellerLabel(
    $id: Int!
    $input: UpdateSellerLabelInput!
    $language: Language
  ) {
    updateSellerLabel(id: $id, input: $input, language: $language) {
      id
      labelName
    }
  }
`;

export const DELETE_SELLER_LABEL = gql`
  mutation DeleteSellerLabel($id: Int!, $language: Language) {
    deleteSellerLabel(id: $id, language: $language) {
      id
    }
  }
`;

export const UPSERT_SELLER_LABEL_TRANSLATION = gql`
  mutation UpsertSellerLabelTranslation(
    $input: UpsertSellerLabelTranslationInput!
    $language: Language
  ) {
    upsertSellerLabelTranslation(input: $input, language: $language) {
      id
      sellerLabelId
      language
      labelName
      description
    }
  }
`;

export const DELETE_SELLER_LABEL_TRANSLATION = gql`
  mutation DeleteSellerLabelTranslation(
    $sellerLabelId: Int!
    $translationLanguage: Language!
    $language: Language
  ) {
    deleteSellerLabelTranslation(
      sellerLabelId: $sellerLabelId
      translationLanguage: $translationLanguage
      language: $language
    ) {
      id
    }
  }
`;
