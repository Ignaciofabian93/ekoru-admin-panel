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

// ─── Bulk upserts (XLSX import / row edits) ──────────────────────────────────
// Rows with an id update, rows without an id create; translations without an id
// are matched by (sellerLevelId, language). Per-row failures come back in errors[].
const LEVEL_BULK_RESULT = gql`
  fragment LevelBulkResult on UsersBulkUpsertResult {
    created
    createdIds
    updated
    failed
    errors {
      index
      id
      message
    }
  }
`;

export const BULK_UPSERT_SELLER_LEVELS = gql`
  ${LEVEL_BULK_RESULT}
  mutation BulkUpsertSellerLevels($rows: [SellerLevelUpsertRowInput!]!) {
    bulkUpsertSellerLevels(rows: $rows) {
      ...LevelBulkResult
    }
  }
`;

export const BULK_UPSERT_SELLER_LEVEL_TRANSLATIONS = gql`
  ${LEVEL_BULK_RESULT}
  mutation BulkUpsertSellerLevelTranslations(
    $rows: [SellerLevelTranslationUpsertRowInput!]!
  ) {
    bulkUpsertSellerLevelTranslations(rows: $rows) {
      ...LevelBulkResult
    }
  }
`;
