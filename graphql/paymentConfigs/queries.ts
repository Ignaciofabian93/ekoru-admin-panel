import { gql } from "@apollo/client";

// Admin reads over ChileanPaymentConfig (ekoru-transactions AdminConfigResolver).
// apiKey/secretKey are write-only and never returned. Source for the CRUD
// screens + XLSX export.

const FIELDS = `
  id
  sellerId
  provider
  merchantId
  environment
  isActive
  webhookUrl
  returnUrl
  cancelUrl
  createdAt
  updatedAt
`;

export const GET_ADMIN_PAYMENT_CONFIGS = gql`
  query AdminChileanPaymentConfigs(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $provider: ChileanPaymentProvider
    $isActive: Boolean
  ) {
    adminChileanPaymentConfigs(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      provider: $provider
      isActive: $isActive
    ) {
      nodes {${FIELDS}}
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
        pageSize
      }
    }
  }
`;
