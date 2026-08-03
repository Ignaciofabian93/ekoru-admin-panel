import { gql } from "@apollo/client";

// Admin-only writes over StoreProduct. The bulk mutation is shared by the
// row-by-row edit form (a one-row array) and the XLSX import (many rows): rows
// with an id update, rows without an id create. Reuses the stores
// `StoreBulkUpsertResult` type. Row failures are reported in `errors[]` without
// aborting the rest of the batch.

export const BULK_UPSERT_STORE_PRODUCTS = gql`
  mutation BulkUpsertStoreProducts($rows: [StoreProductUpsertRowInput!]!) {
    bulkUpsertStoreProducts(rows: $rows) {
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
  }
`;

export const DELETE_STORE_PRODUCT = gql`
  mutation DeleteStoreProduct($id: Int!) {
    deleteStoreProduct(id: $id)
  }
`;

const BULK_RESULT = `
  created
  createdIds
  updated
  failed
  errors { index id message }
`;

export const BULK_UPSERT_STORE_PRODUCT_MATERIALS = gql`
  mutation BulkUpsertStoreProductMaterials($rows: [StoreProductMaterialUpsertRowInput!]!) {
    bulkUpsertStoreProductMaterials(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_STORE_PRODUCT_MATERIAL = gql`
  mutation DeleteStoreProductMaterial($id: Int!) {
    deleteStoreProductMaterial(id: $id)
  }
`;

export const BULK_UPSERT_PRODUCT_VARIANTS = gql`
  mutation BulkUpsertProductVariants($rows: [ProductVariantUpsertRowInput!]!) {
    bulkUpsertProductVariants(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_PRODUCT_VARIANT = gql`
  mutation DeleteProductVariant($id: Int!) {
    deleteProductVariant(id: $id)
  }
`;
