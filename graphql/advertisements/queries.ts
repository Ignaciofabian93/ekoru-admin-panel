import { gql } from "@apollo/client";

// Admin-only raw reads over Advertisement (ekoru-marketplace AdminAdsResolver).
// Every ad (inactive included) — source for the CRUD screens + XLSX export.

const FIELDS = `
  id
  adType
  price
  content
  startDate
  endDate
  isActive
  sellerId
  productId
  storeProductId
  serviceId
  createdAt
  updatedAt
`;

export const GET_RAW_ADVERTISEMENTS = gql`
  query RawAdvertisements(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $adType: AdvertisementType
    $sellerId: String
    $isActive: Boolean
  ) {
    rawAdvertisements(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      adType: $adType
      sellerId: $sellerId
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
