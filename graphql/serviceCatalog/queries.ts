import { gql } from "@apollo/client";

// Admin-only raw reads over the service category tables (ekoru-services
// AdminCatalogResolver). Rows come back exactly as stored: every translation,
// inactive rows included — the source of truth for the CRUD screens and the
// XLSX export.
//
// The translation display-name column is `category` / `subCategory` in the DB;
// both are aliased to `name` so the panel treats translations uniformly.

const PAGE_INFO = gql`
  fragment ServiceCatalogPageInfo on PageInfo {
    currentPage
    totalPages
    totalCount
    hasNextPage
    hasPreviousPage
    pageSize
  }
`;

export const GET_RAW_SERVICE_CATEGORIES = gql`
  ${PAGE_INFO}
  query RawServiceCategories($id: Int, $page: Int, $pageSize: Int, $search: String) {
    rawServiceCategories(id: $id, page: $page, pageSize: $pageSize, search: $search) {
      nodes {
        id
        isActive
        sortOrder
        featuredFrom
        featuredUntil
        createdAt
        updatedAt
        translations {
          id
          serviceCategoryId
          language
          name: category
          slug
          href
          metaTitle
          metaDescription
          metaKeywords
        }
      }
      pageInfo {
        ...ServiceCatalogPageInfo
      }
    }
  }
`;

export const GET_RAW_SERVICE_SUB_CATEGORIES = gql`
  ${PAGE_INFO}
  query RawServiceSubCategories(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $serviceCategoryId: Int
  ) {
    rawServiceSubCategories(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      serviceCategoryId: $serviceCategoryId
    ) {
      nodes {
        id
        serviceCategoryId
        isActive
        sortOrder
        featuredFrom
        featuredUntil
        createdAt
        updatedAt
        translations {
          id
          serviceSubCategoryId
          language
          name: subCategory
          slug
          href
          metaTitle
          metaDescription
          metaKeywords
        }
      }
      pageInfo {
        ...ServiceCatalogPageInfo
      }
    }
  }
`;
