import { gql } from "@apollo/client";

// Admin-only writes over the ekoru-search config tables. Each bulk mutation is
// shared by the row-edit form (a one-row array) and the XLSX import (many rows):
// rows with an id update, rows without create. Row failures come back in
// errors[] without aborting the batch.

const BULK_RESULT = `
  created
  createdIds
  updated
  failed
  errors { index id message }
`;

export const BULK_UPSERT_SEARCH_SYNONYMS = gql`
  mutation BulkUpsertSearchSynonyms($rows: [SearchSynonymUpsertRowInput!]!) {
    bulkUpsertSearchSynonyms(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_SEARCH_SYNONYM = gql`
  mutation DeleteSearchSynonym($id: Int!) {
    deleteSearchSynonym(id: $id)
  }
`;

export const BULK_UPSERT_SEARCH_CORRECTIONS = gql`
  mutation BulkUpsertSearchCorrections($rows: [SearchCorrectionUpsertRowInput!]!) {
    bulkUpsertSearchCorrections(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_SEARCH_CORRECTION = gql`
  mutation DeleteSearchCorrection($id: Int!) {
    deleteSearchCorrection(id: $id)
  }
`;

export const BULK_UPSERT_SEARCH_SUGGESTIONS = gql`
  mutation BulkUpsertSearchSuggestions($rows: [SearchSuggestionUpsertRowInput!]!) {
    bulkUpsertSearchSuggestions(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_SEARCH_SUGGESTION = gql`
  mutation DeleteSearchSuggestion($id: Int!) {
    deleteSearchSuggestion(id: $id)
  }
`;
