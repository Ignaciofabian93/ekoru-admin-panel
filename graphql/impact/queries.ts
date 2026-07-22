import { gql } from "@apollo/client";

// Admin-only raw reads over the marketplace impact tables (ekoru-marketplace
// AdminImpactResolver). Rows come back exactly as stored, every translation
// included — the source of truth for the CRUD screens and the XLSX export.
//
// Water and CO2 messages are the same shape but different GraphQL types; their
// translation parent-id column is aliased to `parentId` so the panel treats
// both uniformly.

const PAGE_INFO = gql`
  fragment ImpactPageInfo on PageInfo {
    currentPage
    totalPages
    totalCount
    hasNextPage
    hasPreviousPage
    pageSize
  }
`;

export const GET_RAW_MATERIAL_IMPACTS = gql`
  ${PAGE_INFO}
  query RawMaterialImpactEstimates(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
  ) {
    rawMaterialImpactEstimates(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
    ) {
      nodes {
        id
        materialType
        estimatedCo2SavingsKG
        estimatedWaterSavingsLT
        createdAt
        updatedAt
        translations {
          id
          materialImpactEstimateId
          language
          materialTypeTranslation
        }
      }
      pageInfo {
        ...ImpactPageInfo
      }
    }
  }
`;

export const GET_RAW_WATER_IMPACTS = gql`
  ${PAGE_INFO}
  query RawWaterImpactMessages($id: Int, $page: Int, $pageSize: Int, $search: String) {
    rawWaterImpactMessages(id: $id, page: $page, pageSize: $pageSize, search: $search) {
      nodes {
        id
        min
        max
        message1
        message2
        message3
        createdAt
        updatedAt
        translations {
          id
          parentId: waterImpactMessageId
          language
          message1
          message2
          message3
        }
      }
      pageInfo {
        ...ImpactPageInfo
      }
    }
  }
`;

export const GET_RAW_CO2_IMPACTS = gql`
  ${PAGE_INFO}
  query RawCo2ImpactMessages($id: Int, $page: Int, $pageSize: Int, $search: String) {
    rawCo2ImpactMessages(id: $id, page: $page, pageSize: $pageSize, search: $search) {
      nodes {
        id
        min
        max
        message1
        message2
        message3
        createdAt
        updatedAt
        translations {
          id
          parentId: co2ImpactMessageId
          language
          message1
          message2
          message3
        }
      }
      pageInfo {
        ...ImpactPageInfo
      }
    }
  }
`;
