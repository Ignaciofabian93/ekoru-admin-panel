import { gql } from "@apollo/client";

// Admin-only writes over the marketplace impact tables. Every bulk mutation
// shares the catalog contract: rows with an id update, rows without an id
// create (translations without id matched by their parent+language unique key).
// A single-row array is a row edit; a many-row array is an XLSX import. Reuses
// the marketplace `BulkUpsertResult` type.

const BULK_RESULT = gql`
  fragment ImpactBulkResult on BulkUpsertResult {
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
`;

// ─── Material impact estimates ────────────────────────────────────────────────

export const BULK_UPSERT_MATERIAL_IMPACTS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertMaterialImpactEstimates(
    $rows: [MaterialImpactEstimateUpsertRowInput!]!
  ) {
    bulkUpsertMaterialImpactEstimates(rows: $rows) {
      ...ImpactBulkResult
    }
  }
`;

export const BULK_UPSERT_MATERIAL_IMPACT_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertMaterialImpactEstimateTranslations(
    $rows: [MaterialImpactEstimateTranslationUpsertRowInput!]!
  ) {
    bulkUpsertMaterialImpactEstimateTranslations(rows: $rows) {
      ...ImpactBulkResult
    }
  }
`;

export const DELETE_MATERIAL_IMPACT = gql`
  mutation DeleteMaterialImpactEstimate($id: Int!) {
    deleteMaterialImpactEstimate(id: $id)
  }
`;

export const DELETE_MATERIAL_IMPACT_TRANSLATION = gql`
  mutation DeleteMaterialImpactEstimateTranslation($id: Int!) {
    deleteMaterialImpactEstimateTranslation(id: $id)
  }
`;

// ─── Water impact messages ────────────────────────────────────────────────────

export const BULK_UPSERT_WATER_IMPACTS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertWaterImpactMessages($rows: [WaterImpactMessageUpsertRowInput!]!) {
    bulkUpsertWaterImpactMessages(rows: $rows) {
      ...ImpactBulkResult
    }
  }
`;

export const BULK_UPSERT_WATER_IMPACT_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertWaterImpactMessageTranslations(
    $rows: [WaterImpactMessageTranslationUpsertRowInput!]!
  ) {
    bulkUpsertWaterImpactMessageTranslations(rows: $rows) {
      ...ImpactBulkResult
    }
  }
`;

export const DELETE_WATER_IMPACT = gql`
  mutation DeleteWaterImpactMessage($id: Int!) {
    deleteWaterImpactMessage(id: $id)
  }
`;

export const DELETE_WATER_IMPACT_TRANSLATION = gql`
  mutation DeleteWaterImpactMessageTranslation($id: Int!) {
    deleteWaterImpactMessageTranslation(id: $id)
  }
`;

// ─── CO2 impact messages ──────────────────────────────────────────────────────

export const BULK_UPSERT_CO2_IMPACTS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertCo2ImpactMessages($rows: [Co2ImpactMessageUpsertRowInput!]!) {
    bulkUpsertCo2ImpactMessages(rows: $rows) {
      ...ImpactBulkResult
    }
  }
`;

export const BULK_UPSERT_CO2_IMPACT_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertCo2ImpactMessageTranslations(
    $rows: [Co2ImpactMessageTranslationUpsertRowInput!]!
  ) {
    bulkUpsertCo2ImpactMessageTranslations(rows: $rows) {
      ...ImpactBulkResult
    }
  }
`;

export const DELETE_CO2_IMPACT = gql`
  mutation DeleteCo2ImpactMessage($id: Int!) {
    deleteCo2ImpactMessage(id: $id)
  }
`;

export const DELETE_CO2_IMPACT_TRANSLATION = gql`
  mutation DeleteCo2ImpactMessageTranslation($id: Int!) {
    deleteCo2ImpactMessageTranslation(id: $id)
  }
`;
