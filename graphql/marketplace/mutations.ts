import { gql } from "@apollo/client";

// Admin-only writes over the marketplace catalog tables. Every bulk mutation
// shares the same contract: rows with an id update, rows without an id create
// (translations without id are matched by their parent+language unique key).
// A single-row array is the row-by-row edit path of the panel; the same
// mutation absorbs a whole spreadsheet on import. Row failures are reported in
// `errors[]` without aborting the rest of the batch.

const BULK_RESULT = gql`
  fragment BulkResult on BulkUpsertResult {
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

// ─── Departments ─────────────────────────────────────────────────────────────

export const BULK_UPSERT_DEPARTMENTS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertDepartments($rows: [DepartmentUpsertRowInput!]!) {
    bulkUpsertDepartments(rows: $rows) {
      ...BulkResult
    }
  }
`;

export const BULK_UPSERT_DEPARTMENT_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertDepartmentTranslations(
    $rows: [DepartmentTranslationUpsertRowInput!]!
  ) {
    bulkUpsertDepartmentTranslations(rows: $rows) {
      ...BulkResult
    }
  }
`;

export const DELETE_DEPARTMENT = gql`
  mutation DeleteDepartment($id: Int!) {
    deleteDepartment(id: $id)
  }
`;

export const DELETE_DEPARTMENT_TRANSLATION = gql`
  mutation DeleteDepartmentTranslation($id: Int!) {
    deleteDepartmentTranslation(id: $id)
  }
`;

// ─── Department categories ───────────────────────────────────────────────────

export const BULK_UPSERT_DEPARTMENT_CATEGORIES = gql`
  ${BULK_RESULT}
  mutation BulkUpsertDepartmentCategories($rows: [DepartmentCategoryUpsertRowInput!]!) {
    bulkUpsertDepartmentCategories(rows: $rows) {
      ...BulkResult
    }
  }
`;

export const BULK_UPSERT_DEPARTMENT_CATEGORY_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertDepartmentCategoryTranslations(
    $rows: [DepartmentCategoryTranslationUpsertRowInput!]!
  ) {
    bulkUpsertDepartmentCategoryTranslations(rows: $rows) {
      ...BulkResult
    }
  }
`;

export const DELETE_DEPARTMENT_CATEGORY = gql`
  mutation DeleteDepartmentCategory($id: Int!) {
    deleteDepartmentCategory(id: $id)
  }
`;

export const DELETE_DEPARTMENT_CATEGORY_TRANSLATION = gql`
  mutation DeleteDepartmentCategoryTranslation($id: Int!) {
    deleteDepartmentCategoryTranslation(id: $id)
  }
`;

// ─── Product categories ──────────────────────────────────────────────────────

export const BULK_UPSERT_PRODUCT_CATEGORIES = gql`
  ${BULK_RESULT}
  mutation BulkUpsertProductCategories($rows: [ProductCategoryUpsertRowInput!]!) {
    bulkUpsertProductCategories(rows: $rows) {
      ...BulkResult
    }
  }
`;

export const BULK_UPSERT_PRODUCT_CATEGORY_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertProductCategoryTranslations(
    $rows: [ProductCategoryTranslationUpsertRowInput!]!
  ) {
    bulkUpsertProductCategoryTranslations(rows: $rows) {
      ...BulkResult
    }
  }
`;

export const DELETE_PRODUCT_CATEGORY = gql`
  mutation DeleteProductCategory($id: Int!) {
    deleteProductCategory(id: $id)
  }
`;

export const DELETE_PRODUCT_CATEGORY_TRANSLATION = gql`
  mutation DeleteProductCategoryTranslation($id: Int!) {
    deleteProductCategoryTranslation(id: $id)
  }
`;

export const BULK_UPSERT_PRODUCT_CATEGORY_MATERIALS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertProductCategoryMaterials(
    $rows: [ProductCategoryMaterialUpsertRowInput!]!
  ) {
    bulkUpsertProductCategoryMaterials(rows: $rows) {
      ...BulkResult
    }
  }
`;

export const DELETE_PRODUCT_CATEGORY_MATERIAL = gql`
  mutation DeleteProductCategoryMaterial($id: Int!) {
    deleteProductCategoryMaterial(id: $id)
  }
`;
