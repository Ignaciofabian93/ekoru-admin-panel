import { gql } from "@apollo/client";

import { SELLER_FIELDS_FRAGMENT } from "./fragments";

// Status mutations exposed to PLATFORM admins. Names follow the gateway's
// admin schema convention — adjust if the backend differs.
export const SET_SELLER_ACTIVE = gql`
  ${SELLER_FIELDS_FRAGMENT}
  mutation AdminSetSellerActive($id: ID!, $isActive: Boolean!) {
    adminSetSellerActive(id: $id, isActive: $isActive) {
      ...SellerFields
    }
  }
`;

export const SET_SELLER_VERIFIED = gql`
  ${SELLER_FIELDS_FRAGMENT}
  mutation AdminSetSellerVerified($id: ID!, $isVerified: Boolean!) {
    adminSetSellerVerified(id: $id, isVerified: $isVerified) {
      ...SellerFields
    }
  }
`;

export const DELETE_SELLER = gql`
  mutation AdminDeleteSeller($id: ID!) {
    adminDeleteSeller(id: $id) {
      success
    }
  }
`;
