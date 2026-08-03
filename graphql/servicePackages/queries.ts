import { gql } from "@apollo/client";

// Admin-only raw reads over ServicePackage (ekoru-services AdminServicesResolver),
// each package carrying its items. Source for the CRUD screens + XLSX export.

export const GET_RAW_SERVICE_PACKAGES = gql`
  query RawServicePackages(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $sellerId: String
    $isActive: Boolean
  ) {
    rawServicePackages(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      sellerId: $sellerId
      isActive: $isActive
    ) {
      nodes {
        id
        sellerId
        name
        description
        totalPrice
        discountPercentage
        validityDays
        isActive
        createdAt
        updatedAt
        servicePackageItem {
          id
          packageId
          serviceId
          quantity
        }
      }
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
