import { gql } from "@apollo/client";

// Admin-only writes over the store catalog tables. Every bulk mutation shares
// the same contract: rows with an id update, rows without an id create
// (translations without id are matched by their parent+language unique key).
// A single-row array is the row-by-row edit path of the panel; the same
// mutation absorbs a whole spreadsheet on import. Row failures are reported in
// `errors[]` without aborting the rest of the batch.

const BULK_RESULT = gql`
  fragment StoreBulkResult on StoreBulkUpsertResult {
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

// ─── Store categories ────────────────────────────────────────────────────────

export const BULK_UPSERT_STORE_CATEGORIES = gql`
  ${BULK_RESULT}
  mutation BulkUpsertStoreCategories($rows: [StoreCategoryUpsertRowInput!]!) {
    bulkUpsertStoreCategories(rows: $rows) {
      ...StoreBulkResult
    }
  }
`;

export const BULK_UPSERT_STORE_CATEGORY_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertStoreCategoryTranslations(
    $rows: [StoreCategoryTranslationUpsertRowInput!]!
  ) {
    bulkUpsertStoreCategoryTranslations(rows: $rows) {
      ...StoreBulkResult
    }
  }
`;

export const DELETE_STORE_CATEGORY = gql`
  mutation DeleteStoreCategory($id: Int!) {
    deleteStoreCategory(id: $id)
  }
`;

export const DELETE_STORE_CATEGORY_TRANSLATION = gql`
  mutation DeleteStoreCategoryTranslation($id: Int!) {
    deleteStoreCategoryTranslation(id: $id)
  }
`;

// ─── Store sub categories ────────────────────────────────────────────────────

export const BULK_UPSERT_STORE_SUB_CATEGORIES = gql`
  ${BULK_RESULT}
  mutation BulkUpsertStoreSubCategories($rows: [StoreSubCategoryUpsertRowInput!]!) {
    bulkUpsertStoreSubCategories(rows: $rows) {
      ...StoreBulkResult
    }
  }
`;

export const BULK_UPSERT_STORE_SUB_CATEGORY_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertStoreSubCategoryTranslations(
    $rows: [StoreSubCategoryTranslationUpsertRowInput!]!
  ) {
    bulkUpsertStoreSubCategoryTranslations(rows: $rows) {
      ...StoreBulkResult
    }
  }
`;

export const DELETE_STORE_SUB_CATEGORY = gql`
  mutation DeleteStoreSubCategory($id: Int!) {
    deleteStoreSubCategory(id: $id)
  }
`;

export const DELETE_STORE_SUB_CATEGORY_TRANSLATION = gql`
  mutation DeleteStoreSubCategoryTranslation($id: Int!) {
    deleteStoreSubCategoryTranslation(id: $id)
  }
`;
