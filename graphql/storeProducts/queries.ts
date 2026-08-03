import { gql } from "@apollo/client";

// Admin-only raw reads over StoreProduct (ekoru-stores AdminStoreProductResolver).
// Returns the whole catalog exactly as stored — inactive and soft-deleted
// included — the source of truth for the CRUD screens and the XLSX export.

const STORE_PRODUCT_FIELDS = gql`
  fragment RawStoreProductFields on RawStoreProduct {
    id
    name
    description
    stock
    barcode
    sku
    price
    hasOffer
    offerPrice
    sellerId
    images
    isActive
    badges
    brand
    color
    averageRating
    reviewsNumber
    likesCount
    saleCount
    viewCount
    materialComposition
    recycledContent
    weight
    weightUnit
    length
    width
    height
    dimensionUnit
    lowStockThreshold
    isLowStock
    tags
    metaTitle
    metaDescription
    warranty
    warrantyDuration
    features
    subCategoryId
    featuredFrom
    featuredUntil
    createdAt
    updatedAt
    deletedAt
    materials {
      id
      storeProductId
      materialTypeId
      materialType
      percentage
    }
    variants {
      id
      storeProductId
      name
      price
      stock
      color
      size
    }
  }
`;

export const GET_RAW_STORE_PRODUCTS = gql`
  ${STORE_PRODUCT_FIELDS}
  query RawStoreProducts(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $subCategoryId: Int
    $sellerId: String
    $deleted: Boolean
  ) {
    rawStoreProducts(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      subCategoryId: $subCategoryId
      sellerId: $sellerId
      deleted: $deleted
    ) {
      nodes {
        ...RawStoreProductFields
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
