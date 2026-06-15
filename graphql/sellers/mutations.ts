import { gql } from "@apollo/client";

import { SELLER_FIELDS_FRAGMENT } from "./fragments";

// Status/lifecycle mutations for PLATFORM admins. Names + argument types mirror
// the `ekoru-users` SellersResolver (code-first, so scalar ids are `String!`,
// not `ID!`). Each returns the updated Seller so the caller can refresh in place.

/** Toggle a seller's verified status after admin review. Requires MANAGE_USERS. */
export const VERIFY_SELLER = gql`
  ${SELLER_FIELDS_FRAGMENT}
  mutation VerifySeller($id: String!, $language: Language!) {
    verifySeller(id: $id, language: $language) {
      ...SellerFields
    }
  }
`;

/**
 * Ban a seller: deactivates and unverifies the account and records a ban
 * history row. Requires BAN_USERS and an auditable `reason` (>= 5 chars).
 */
export const BAN_SELLER = gql`
  ${SELLER_FIELDS_FRAGMENT}
  mutation BanSeller($id: String!, $input: BanSellerInput!, $language: Language!) {
    banSeller(id: $id, input: $input, language: $language) {
      ...SellerFields
    }
  }
`;

/** Lift an active ban and reactivate the account. Requires BAN_USERS. */
export const REINSTATE_SELLER = gql`
  ${SELLER_FIELDS_FRAGMENT}
  mutation ReinstateSeller($id: String!, $language: Language!, $unbanReason: String) {
    reinstateSeller(id: $id, language: $language, unbanReason: $unbanReason) {
      ...SellerFields
    }
  }
`;
