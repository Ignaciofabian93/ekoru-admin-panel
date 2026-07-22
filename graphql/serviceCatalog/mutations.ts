import { gql } from "@apollo/client";

// Admin-only writes over the service category tables. Every bulk mutation
// shares the catalog contract: rows with an id update, rows without an id
// create (translations without id matched by their parent+language unique key).
// A single-row array is a row edit; a many-row array is an XLSX import. Reuses
// the services `ServiceBulkUpsertResult` type.

const BULK_RESULT = gql`
  fragment ServiceBulkResult on ServiceBulkUpsertResult {
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

// ─── Service categories ────────────────────────────────────────────────────────

export const BULK_UPSERT_SERVICE_CATEGORIES = gql`
  ${BULK_RESULT}
  mutation BulkUpsertServiceCategories($rows: [ServiceCategoryUpsertRowInput!]!) {
    bulkUpsertServiceCategories(rows: $rows) {
      ...ServiceBulkResult
    }
  }
`;

export const BULK_UPSERT_SERVICE_CATEGORY_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertServiceCategoryTranslations(
    $rows: [ServiceCategoryTranslationUpsertRowInput!]!
  ) {
    bulkUpsertServiceCategoryTranslations(rows: $rows) {
      ...ServiceBulkResult
    }
  }
`;

export const DELETE_SERVICE_CATEGORY = gql`
  mutation DeleteServiceCategory($id: Int!) {
    deleteServiceCategory(id: $id)
  }
`;

export const DELETE_SERVICE_CATEGORY_TRANSLATION = gql`
  mutation DeleteServiceCategoryTranslation($id: Int!) {
    deleteServiceCategoryTranslation(id: $id)
  }
`;

// ─── Service sub categories ─────────────────────────────────────────────────────

export const BULK_UPSERT_SERVICE_SUB_CATEGORIES = gql`
  ${BULK_RESULT}
  mutation BulkUpsertServiceSubCategories($rows: [ServiceSubCategoryUpsertRowInput!]!) {
    bulkUpsertServiceSubCategories(rows: $rows) {
      ...ServiceBulkResult
    }
  }
`;

export const BULK_UPSERT_SERVICE_SUB_CATEGORY_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertServiceSubCategoryTranslations(
    $rows: [ServiceSubCategoryTranslationUpsertRowInput!]!
  ) {
    bulkUpsertServiceSubCategoryTranslations(rows: $rows) {
      ...ServiceBulkResult
    }
  }
`;

export const DELETE_SERVICE_SUB_CATEGORY = gql`
  mutation DeleteServiceSubCategory($id: Int!) {
    deleteServiceSubCategory(id: $id)
  }
`;

export const DELETE_SERVICE_SUB_CATEGORY_TRANSLATION = gql`
  mutation DeleteServiceSubCategoryTranslation($id: Int!) {
    deleteServiceSubCategoryTranslation(id: $id)
  }
`;
