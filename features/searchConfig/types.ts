import type { DocumentNode } from "@apollo/client";
import {
  GET_RAW_SEARCH_SYNONYMS,
  GET_RAW_SEARCH_CORRECTIONS,
  GET_RAW_SEARCH_SUGGESTIONS,
} from "@/graphql/searchConfig/queries";
import {
  BULK_UPSERT_SEARCH_SYNONYMS,
  DELETE_SEARCH_SYNONYM,
  BULK_UPSERT_SEARCH_CORRECTIONS,
  DELETE_SEARCH_CORRECTION,
  BULK_UPSERT_SEARCH_SUGGESTIONS,
  DELETE_SEARCH_SUGGESTION,
} from "@/graphql/searchConfig/mutations";

/**
 * The three ekoru-search config tables share one config-driven admin feature:
 * they're all flat, single-language rows (a text term + numeric weights + an
 * active flag), so a single generic list/form/XLSX is driven by the per-kind
 * `KIND_CONFIG` below instead of three near-identical copies.
 */
export type SearchKind = "synonyms" | "corrections" | "suggestions";

export type FieldType = "string" | "int" | "float" | "bool";

export interface FieldSpec {
  /** Backend column name (also the XLSX header and i18n `fields.<key>`). */
  key: string;
  type: FieldType;
  /** Required to create a new row (ignored on update). */
  requiredForCreate?: boolean;
}

/** A raw row — id + timestamps + the table's own columns. */
export type SearchRow = {
  id: number;
  createdAt: string;
  updatedAt: string;
} & Record<string, unknown>;

/** An upsert row — id present = update, absent = create. */
export type SearchUpsertRow = { id?: number } & Record<string, unknown>;

export type RawCatalogPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

export type BulkRowError = { index: number; id: number | null; message: string };

export type BulkUpsertResult = {
  created: number;
  createdIds: number[];
  updated: number;
  failed: number;
  errors: BulkRowError[];
};

export interface KindConfig {
  /** Sidebar `to` value / route segment. */
  route: string;
  listQuery: DocumentNode;
  /** The query's root field name (e.g. `rawSearchSynonyms`). */
  listField: string;
  upsertMutation: DocumentNode;
  /** The mutation's root field name. */
  upsertField: string;
  deleteMutation: DocumentNode;
  deleteField: string;
  fields: FieldSpec[];
  /** The primary text column shown in the list + used as the search target. */
  primaryField: string;
}

export const KIND_CONFIG: Record<SearchKind, KindConfig> = {
  synonyms: {
    route: "search-synonyms",
    listQuery: GET_RAW_SEARCH_SYNONYMS,
    listField: "rawSearchSynonyms",
    upsertMutation: BULK_UPSERT_SEARCH_SYNONYMS,
    upsertField: "bulkUpsertSearchSynonyms",
    deleteMutation: DELETE_SEARCH_SYNONYM,
    deleteField: "deleteSearchSynonym",
    primaryField: "term",
    fields: [
      { key: "term", type: "string", requiredForCreate: true },
      { key: "synonym", type: "string", requiredForCreate: true },
      { key: "weight", type: "float" },
      { key: "isActive", type: "bool" },
    ],
  },
  corrections: {
    route: "search-corrections",
    listQuery: GET_RAW_SEARCH_CORRECTIONS,
    listField: "rawSearchCorrections",
    upsertMutation: BULK_UPSERT_SEARCH_CORRECTIONS,
    upsertField: "bulkUpsertSearchCorrections",
    deleteMutation: DELETE_SEARCH_CORRECTION,
    deleteField: "deleteSearchCorrection",
    primaryField: "incorrectTerm",
    fields: [
      { key: "incorrectTerm", type: "string", requiredForCreate: true },
      { key: "correctTerm", type: "string", requiredForCreate: true },
      { key: "frequency", type: "int" },
      { key: "confidence", type: "float" },
      { key: "isActive", type: "bool" },
    ],
  },
  suggestions: {
    route: "search-suggestions",
    listQuery: GET_RAW_SEARCH_SUGGESTIONS,
    listField: "rawSearchSuggestions",
    upsertMutation: BULK_UPSERT_SEARCH_SUGGESTIONS,
    upsertField: "bulkUpsertSearchSuggestions",
    deleteMutation: DELETE_SEARCH_SUGGESTION,
    deleteField: "deleteSearchSuggestion",
    primaryField: "term",
    fields: [
      { key: "term", type: "string", requiredForCreate: true },
      { key: "frequency", type: "int" },
      { key: "isActive", type: "bool" },
    ],
  },
};
