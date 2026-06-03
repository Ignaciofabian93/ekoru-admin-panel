import { gql } from "@apollo/client";

import {
  BUSINESS_PROFILE_FIELDS_FRAGMENT,
  PERSON_PROFILE_FIELDS_FRAGMENT,
  SELLER_FIELDS_FRAGMENT,
} from "./fragments";

// Admin-scoped listing. The gateway is expected to authorize PLATFORM admins
// for the full list; align argument/field names with the actual admin schema.
export const LIST_SELLERS = gql`
  ${SELLER_FIELDS_FRAGMENT}
  ${PERSON_PROFILE_FIELDS_FRAGMENT}
  ${BUSINESS_PROFILE_FIELDS_FRAGMENT}
  query AdminListSellers($search: String, $limit: Int, $offset: Int) {
    adminSellers(search: $search, limit: $limit, offset: $offset) {
      items {
        ...SellerFields
        profile {
          ... on PersonProfile {
            ...PersonProfileFields
          }
          ... on BusinessProfile {
            ...BusinessProfileFields
          }
        }
      }
      total
    }
  }
`;

export const GET_SELLER = gql`
  ${SELLER_FIELDS_FRAGMENT}
  ${PERSON_PROFILE_FIELDS_FRAGMENT}
  ${BUSINESS_PROFILE_FIELDS_FRAGMENT}
  query AdminGetSeller($id: ID!) {
    adminSeller(id: $id) {
      ...SellerFields
      profile {
        ... on PersonProfile {
          ...PersonProfileFields
        }
        ... on BusinessProfile {
          ...BusinessProfileFields
        }
      }
    }
  }
`;
