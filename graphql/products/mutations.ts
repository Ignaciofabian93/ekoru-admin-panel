import { gql } from "@apollo/client";

// Admin-only writes over the marketplace Product table. The bulk mutation is
// shared by the row-by-row edit form (a one-row array) and the XLSX import
// (many rows): rows with an id update, rows without an id create. Reuses the
// marketplace `BulkUpsertResult` type.

export const BULK_UPSERT_PRODUCTS = gql`
  mutation BulkUpsertProducts($rows: [ProductUpsertRowInput!]!) {
    bulkUpsertProducts(rows: $rows) {
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

/**
 * The admin hard delete, which is `hardDeleteProduct` — `deleteProduct` is the
 * seller's own soft delete and refuses a caller without a seller claim on the
 * listing. Returns `Boolean!`, so no selection set, and takes `Int!`.
 */
export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: Int!) {
    hardDeleteProduct(id: $id)
  }
`;
