import { gql } from "@apollo/client";

// The business's own listings for Catálogo y fotos (ADM-16). The raw reads are
// scoped to the caller's store for a business account; visibility changes go
// through the spreadsheet mutations with just `id` and `isActive`.
export const CATALOG_STORE_PRODUCTS = gql`
  query BusinessCatalogStoreProducts($page: Int, $pageSize: Int) {
    rawStoreProducts(page: $page, pageSize: $pageSize, deleted: false) {
      nodes {
        id
        name
        price
        stock
        isActive
        images
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export const CATALOG_SERVICES = gql`
  query BusinessCatalogServices($page: Int, $pageSize: Int) {
    rawServices(page: $page, pageSize: $pageSize) {
      nodes {
        id
        name
        basePrice
        pricingType
        isActive
        images
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;
