import { gql } from "@apollo/client";

// Admin writes for the transaction-config tables. Each bulk mutation is shared
// by the row-edit form (a one-row array) and the XLSX import (many rows): rows
// with an id update, rows without create. Row failures come back in errors[]
// without aborting the batch.

const BULK_RESULT = `
  created
  createdIds
  updated
  failed
  errors { index id message }
`;

export const BULK_UPSERT_POINTS_BY_TRANSACTION_KIND = gql`
  mutation BulkUpsertPointsByTransactionKind($rows: [PointsByTransactionKindUpsertRowInput!]!) {
    bulkUpsertPointsByTransactionKind(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_POINTS_BY_TRANSACTION_KIND = gql`
  mutation DeletePointsByTransactionKind($id: Int!) {
    deletePointsByTransactionKind(id: $id) {
      id
    }
  }
`;

export const BULK_UPSERT_TRANSACTION_FEES = gql`
  mutation BulkUpsertTransactionFees($rows: [TransactionFeeUpsertRowInput!]!) {
    bulkUpsertTransactionFees(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_TRANSACTION_FEE = gql`
  mutation DeleteTransactionFee($id: ID!) {
    deleteTransactionFee(id: $id) {
      id
    }
  }
`;
