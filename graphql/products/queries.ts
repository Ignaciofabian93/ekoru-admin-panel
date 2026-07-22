import { gql } from "@apollo/client";

// Admin-only raw reads over the marketplace Product table (ekoru-marketplace
// AdminProductResolver). Returns the whole catalog exactly as stored — inactive
// and soft-deleted included — the source of truth for the CRUD screens and the
// XLSX export.

const PRODUCT_FIELDS = gql`
  fragment RawProductFields on RawProduct {
    id
    name
    description
    color
    images
    brand
    price
    productCategoryId
    badges
    interests
    condition
    conditionDescription
    isActive
    isExchangeable
    sellerId
    viewCount
    likesCount
    featuredFrom
    featuredUntil
    createdAt
    updatedAt
    deletedAt
  }
`;

export const GET_RAW_PRODUCTS = gql`
  ${PRODUCT_FIELDS}
  query RawProducts(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $productCategoryId: Int
    $sellerId: String
    $deleted: Boolean
  ) {
    rawProducts(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      productCategoryId: $productCategoryId
      sellerId: $sellerId
      deleted: $deleted
    ) {
      nodes {
        ...RawProductFields
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
