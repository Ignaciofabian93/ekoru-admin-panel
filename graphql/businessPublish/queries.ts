import { gql } from "@apollo/client";

// What the publishing spreadsheet (ADM-16) lists for reference: the same
// public catalogs and materials the web's publish form reads.
export const STORE_CATALOG_REFS = gql`
  query BusinessPublishStoreCatalog($language: Language = ES) {
    getStoreCatalog(language: $language) {
      id
      name
      subCategoryItems {
        id
        name
      }
    }
  }
`;

export const SERVICE_CATALOG_REFS = gql`
  query BusinessPublishServiceCatalog($language: Language = ES) {
    getServiceCatalog(language: $language) {
      id
      name
      subCategoryItems {
        id
        name
      }
    }
  }
`;

export const MATERIAL_REFS = gql`
  query BusinessPublishMaterials($language: Language = ES) {
    materials(language: $language) {
      id
      materialType
      label
    }
  }
`;

// The business's own catalog, for "download my catalog". The raw reads are
// scoped to the caller's store for a business account.
export const MY_STORE_PRODUCTS_EXPORT = gql`
  query BusinessPublishMyStoreProducts($page: Int, $pageSize: Int) {
    rawStoreProducts(page: $page, pageSize: $pageSize, deleted: false) {
      nodes {
        id
        name
        description
        subCategoryId
        price
        stock
        hasOffer
        offerPrice
        brand
        color
        sku
        barcode
        weight
        weightUnit
        size
        length
        width
        height
        dimensionUnit
        recycledContent
        warranty
        warrantyDuration
        tags
        features
        badges
        isActive
        images
        materials {
          materialTypeId
          materialType
          percentage
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export const MY_SERVICES_EXPORT = gql`
  query BusinessPublishMyServices($page: Int, $pageSize: Int) {
    rawServices(page: $page, pageSize: $pageSize) {
      nodes {
        id
        name
        description
        subcategoryId
        pricingType
        basePrice
        priceRange
        duration
        isRemoteService
        serviceRadius
        tags
        isActive
        images
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;
