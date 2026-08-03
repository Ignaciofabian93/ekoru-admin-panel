import { gql } from "@apollo/client";

// Admin-only raw reads over the marketplace catalog tables (ekoru-marketplace
// AdminCatalogResolver). Rows come back exactly as stored: every translation,
// inactive rows included — the source of truth for the CRUD screens and the
// XLSX export.

const PAGE_INFO = gql`
  fragment RawCatalogPageInfo on PageInfo {
    currentPage
    totalPages
    totalCount
    hasNextPage
    hasPreviousPage
    pageSize
  }
`;

export const GET_RAW_DEPARTMENTS = gql`
  ${PAGE_INFO}
  query RawDepartments($id: Int, $page: Int, $pageSize: Int, $search: String) {
    rawDepartments(id: $id, page: $page, pageSize: $pageSize, search: $search) {
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
          departmentId
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
        ...RawCatalogPageInfo
      }
    }
  }
`;

export const GET_RAW_DEPARTMENT_CATEGORIES = gql`
  ${PAGE_INFO}
  query RawDepartmentCategories(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $departmentId: Int
  ) {
    rawDepartmentCategories(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      departmentId: $departmentId
    ) {
      nodes {
        id
        departmentId
        isActive
        sortOrder
        featuredFrom
        featuredUntil
        createdAt
        updatedAt
        translations {
          id
          departmentCategoryId
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
        ...RawCatalogPageInfo
      }
    }
  }
`;

export const GET_RAW_PRODUCT_CATEGORIES = gql`
  ${PAGE_INFO}
  query RawProductCategories(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $departmentCategoryId: Int
  ) {
    rawProductCategories(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      departmentCategoryId: $departmentCategoryId
    ) {
      nodes {
        id
        departmentCategoryId
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
          productCategoryId
          language
          name
          slug
          keywords
          href
          metaTitle
          metaDescription
          metaKeywords
        }
        materials {
          id
          productCategoryId
          materialTypeId
          materialType
          quantity
          unit
          isPrimary
        }
      }
      pageInfo {
        ...RawCatalogPageInfo
      }
    }
  }
`;
