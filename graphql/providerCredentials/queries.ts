import { gql } from "@apollo/client";

// Admin-only reads over ServiceProviderCredentials (one row per seller).
// ekoru-services AdminServicesResolver. Source for the CRUD screens + XLSX.

const FIELDS = `
  id
  sellerId
  licenseNumber
  licenseType
  licenseExpiryDate
  isLicenseVerified
  insuranceProvider
  insurancePolicyNumber
  insuranceExpiryDate
  insuranceCoverage
  backgroundCheckDate
  backgroundCheckStatus
  createdAt
  updatedAt
`;

export const GET_RAW_SERVICE_CREDENTIALS = gql`
  query RawServiceCredentials(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $isLicenseVerified: Boolean
  ) {
    rawServiceCredentials(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      isLicenseVerified: $isLicenseVerified
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
