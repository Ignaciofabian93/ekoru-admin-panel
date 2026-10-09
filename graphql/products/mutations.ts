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
 * The admin hard delete, `deleteProductByAdmin` (needs MANAGE_PRODUCTS).
 * `deleteProduct` is the seller's own delete and refuses a caller without a
 * seller claim on the listing. Takes `Int!` and returns the deleted id
 * (`Int!`), so no selection set. Fails while order items, exchanges or chats
 * still reference the product.
 */
export const DELETE_PRODUCT = gql`
  mutation DeleteProductByAdmin($id: Int!) {
    deleteProductByAdmin(id: $id)
  }
`;
