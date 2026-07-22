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

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id)
  }
`;
