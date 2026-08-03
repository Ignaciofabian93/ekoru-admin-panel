import { gql } from "@apollo/client";

// Admin reads for the two flat "transaction config" tables that live in
// different subgraphs: PointsByTransactionKind (ekoru-users) and TransactionFee
// (ekoru-transactions). Both are tiny (a handful of rows) so they return plain
// arrays — the panel filters/sorts client-side.

export const GET_POINTS_BY_TRANSACTION_KINDS = gql`
  query PointsByTransactionKinds {
    pointsByTransactionKinds {
      id
      transactionKind
      pointsAwarded
      description
      createdAt
      updatedAt
    }
  }
`;

export const GET_POINTS_BY_TRANSACTION_KIND = gql`
  query PointsByTransactionKind($id: Int!) {
    pointsByTransactionKind(id: $id) {
      id
      transactionKind
      pointsAwarded
      description
      createdAt
      updatedAt
    }
  }
`;

export const GET_ADMIN_TRANSACTION_FEES = gql`
  query AdminTransactionFees {
    adminTransactionFees {
      id
      sellerTypeFee
      feePercentage
      description
    }
  }
`;

export const GET_ADMIN_TRANSACTION_FEE = gql`
  query AdminTransactionFee($id: ID!) {
    adminTransactionFee(id: $id) {
      id
      sellerTypeFee
      feePercentage
      description
    }
  }
`;
