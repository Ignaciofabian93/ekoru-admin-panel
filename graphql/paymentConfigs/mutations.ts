import { gql } from "@apollo/client";

// Admin writes over ChileanPaymentConfig. The bulk mutation backs both the
// row-edit form (a one-row array) and the XLSX import (many rows): rows with an
// id update, rows without create (matched on the unique sellerId+provider).
// apiKey/secretKey are write-only — set only when a value is provided.

export const BULK_UPSERT_PAYMENT_CONFIGS = gql`
  mutation BulkUpsertChileanPaymentConfigs(
    $rows: [ChileanPaymentConfigUpsertRowInput!]!
  ) {
    bulkUpsertChileanPaymentConfigs(rows: $rows) {
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

export const DELETE_PAYMENT_CONFIG = gql`
  mutation DeleteChileanPaymentConfig($id: ID!) {
    deleteChileanPaymentConfig(id: $id) {
      id
    }
  }
`;
