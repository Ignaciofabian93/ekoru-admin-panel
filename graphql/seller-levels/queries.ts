import { gql } from "@apollo/client";

// Seller levels are admin-managed point tiers. Mirrors AccountResolver
// (sellerLevels / sellerLevel) in ekoru-users. `benefits` is free-form JSON.
export const SELLER_LEVELS = gql`
  query SellerLevels($language: Language) {
    sellerLevels(language: $language) {
      id
      levelName
      minPoints
      maxPoints
      badgeIcon
    }
  }
`;

export const SELLER_LEVEL = gql`
  query SellerLevel($id: Int!, $language: Language) {
    sellerLevel(id: $id, language: $language) {
      id
      levelName
      minPoints
      maxPoints
      benefits
      badgeIcon
      createdAt
      updatedAt
      translations {
        id
        sellerLevelId
        language
        levelName
      }
    }
  }
`;
