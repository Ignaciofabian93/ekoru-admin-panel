import { gql } from "@apollo/client";

// Admin-only raw reads over the store catalog tables (ekoru-stores
// AdminCatalogResolver). Rows come back exactly as stored: every translation,
// inactive rows included — the source of truth for the CRUD screens and the
// XLSX export.

const PAGE_INFO = gql`
  fragment RawStoreCatalogPageInfo on PageInfo {
    currentPage
    totalPages
    totalCount
    hasNextPage
    hasPreviousPage
    pageSize
  }
`;

export const GET_RAW_STORE_CATEGORIES = gql`
  ${PAGE_INFO}
  query RawStoreCategories($id: Int, $page: Int, $pageSize: Int, $search: String) {
    rawStoreCategories(id: $id, page: $page, pageSize: $pageSize, search: $search) {
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
          storeCategoryId
          language
          name
          slug
          href
          metaTitle
          metaDescription
          metaKeywords
        }
      }
      pageInfo {
        ...RawStoreCatalogPageInfo
      }
    }
  }
`;

export const GET_RAW_STORE_SUB_CATEGORIES = gql`
  ${PAGE_INFO}
  query RawStoreSubCategories(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $storeCategoryId: Int
  ) {
    rawStoreSubCategories(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      storeCategoryId: $storeCategoryId
    ) {
      nodes {
        id
        storeCategoryId
        averageWeight
        size
        weightUnit
        isActive
        sortOrder
        featuredFrom
        featuredUntil
        createdAt
        updatedAt
        translations {
          id
          storeSubCategoryId
          language
          name
          slug
          keywords
          href
          metaTitle
          metaDescription
        }
      }
      pageInfo {
        ...RawStoreCatalogPageInfo
      }
    }
  }
`;
