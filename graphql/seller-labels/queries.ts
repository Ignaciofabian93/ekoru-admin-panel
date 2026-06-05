import { gql } from "@apollo/client";

// Seller labels are admin-managed gamification badges. Mirrors AccountResolver
// (sellerLabels / sellerLabel) in ekoru-users. Both return translations[] (plural).
export const SELLER_LABELS = gql`
  query SellerLabels($language: Language) {
    sellerLabels(language: $language) {
      id
      labelName
      transactionKind
      transactionsRequired
      description
      badgeIcon
    }
  }
`;

export const SELLER_LABEL = gql`
  query SellerLabel($id: Int!, $language: Language) {
    sellerLabel(id: $id, language: $language) {
      id
      labelName
      transactionKind
      transactionsRequired
      description
      badgeIcon
      createdAt
      updatedAt
      translations {
        id
        sellerLabelId
        language
        labelName
        description
      }
    }
  }
`;
