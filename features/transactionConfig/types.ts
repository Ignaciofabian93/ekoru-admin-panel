import type { DocumentNode } from "@apollo/client";
import {
  GET_POINTS_BY_TRANSACTION_KINDS,
  GET_POINTS_BY_TRANSACTION_KIND,
  GET_ADMIN_TRANSACTION_FEES,
  GET_ADMIN_TRANSACTION_FEE,
} from "@/graphql/transactionConfig/queries";
import {
  BULK_UPSERT_POINTS_BY_TRANSACTION_KIND,
  DELETE_POINTS_BY_TRANSACTION_KIND,
  BULK_UPSERT_TRANSACTION_FEES,
  DELETE_TRANSACTION_FEE,
} from "@/graphql/transactionConfig/mutations";

/**
 * Two flat config tables from different subgraphs share one config-driven admin
 * feature: `points` = PointsByTransactionKind (ekoru-users, points awarded per
 * transaction kind) and `fees` = TransactionFee (ekoru-transactions, fee % per
 * seller type). Both are a small enum key + a number + a note, so a single
 * generic list/form/XLSX is driven by the per-kind `KIND_CONFIG` below.
 */
export type TxConfigKind = "points" | "fees";

export type TxFieldType = "string" | "int" | "float" | "enum";

export interface TxFieldSpec {
  /** Backend column name (also the XLSX header and i18n `fields.<key>`). */
  key: string;
  type: TxFieldType;
  /** Required to create a new row (ignored on update). */
  requiredForCreate?: boolean;
  /** Allowed values for `enum` fields (rendered as a dropdown). */
  options?: readonly string[];
}

/** Points id is an Int, fee id is a GraphQL ID (string) — handle both. */
export type TxId = string | number;

/** A raw row — id + the table's own columns (+ optional timestamps). */
export type TxRow = {
  id: TxId;
  createdAt?: string;
  updatedAt?: string;
} & Record<string, unknown>;

/** An upsert row — id present = update, absent = create. */
export type TxUpsertRow = { id?: TxId } & Record<string, unknown>;

export type TxBulkRowError = { index: number; id: TxId | null; message: string };

export type BulkUpsertResult = {
  created: number;
  createdIds: TxId[];
  updated: number;
  failed: number;
  errors: TxBulkRowError[];
};

export interface TxKindConfig {
  /** Sidebar `to` value / route segment. */
  route: string;
  listQuery: DocumentNode;
  /** The list query's root field name (e.g. `pointsByTransactionKinds`). */
  listField: string;
  itemQuery: DocumentNode;
  /** The single-row query's root field name. */
  itemField: string;
  upsertMutation: DocumentNode;
  upsertField: string;
  deleteMutation: DocumentNode;
  deleteField: string;
  fields: TxFieldSpec[];
  /** The key column shown first in the list + used as the search target. */
  primaryField: string;
  /** Coerces a route id param to the query variable type (Int vs ID). */
  coerceId: (raw: string) => TxId;
  /** Whether rows carry createdAt/updatedAt (export-only reference columns). */
  hasTimestamps: boolean;
}

// Enum value sets, kept in sync with the subgraph Prisma enums.
const TRANSACTION_KINDS = [
  "PURCHASE",
  "SELL",
  "STOREPURCHASE",
  "EXCHANGE",
  "RECYCLE",
  "REPAIR",
  "ATTENDTOWORKSHOP",
  "ATTENDTOEVENT",
  "REGISTRATION",
  "BONUS",
] as const;

const SELLER_TYPES = ["PERSON", "STARTUP", "COMPANY"] as const;

export const KIND_CONFIG: Record<TxConfigKind, TxKindConfig> = {
  points: {
    route: "transaction-points",
    listQuery: GET_POINTS_BY_TRANSACTION_KINDS,
    listField: "pointsByTransactionKinds",
    itemQuery: GET_POINTS_BY_TRANSACTION_KIND,
    itemField: "pointsByTransactionKind",
    upsertMutation: BULK_UPSERT_POINTS_BY_TRANSACTION_KIND,
    upsertField: "bulkUpsertPointsByTransactionKind",
    deleteMutation: DELETE_POINTS_BY_TRANSACTION_KIND,
    deleteField: "deletePointsByTransactionKind",
    primaryField: "transactionKind",
    coerceId: (raw) => Number(raw),
    hasTimestamps: true,
    fields: [
      {
        key: "transactionKind",
        type: "enum",
        options: TRANSACTION_KINDS,
        requiredForCreate: true,
      },
      { key: "pointsAwarded", type: "int", requiredForCreate: true },
      { key: "description", type: "string" },
    ],
  },
  fees: {
    route: "transaction-fees",
    listQuery: GET_ADMIN_TRANSACTION_FEES,
    listField: "adminTransactionFees",
    itemQuery: GET_ADMIN_TRANSACTION_FEE,
    itemField: "adminTransactionFee",
    upsertMutation: BULK_UPSERT_TRANSACTION_FEES,
    upsertField: "bulkUpsertTransactionFees",
    deleteMutation: DELETE_TRANSACTION_FEE,
    deleteField: "deleteTransactionFee",
    primaryField: "sellerTypeFee",
    coerceId: (raw) => raw,
    hasTimestamps: false,
    fields: [
      {
        key: "sellerTypeFee",
        type: "enum",
        options: SELLER_TYPES,
        requiredForCreate: true,
      },
      { key: "feePercentage", type: "float", requiredForCreate: true },
      { key: "description", type: "string", requiredForCreate: true },
    ],
  },
};
