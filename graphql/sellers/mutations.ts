import { gql } from "@apollo/client";

import { BUSINESS_PROFILE_FIELDS_FRAGMENT, SELLER_FIELDS_FRAGMENT } from "./fragments";

// Status/lifecycle mutations for PLATFORM admins. Names + argument types mirror
// the `ekoru-users` SellersResolver (code-first, so scalar ids are `String!`,
// not `ID!`). Each returns the updated Seller so the caller can refresh in place.

/** Toggle a seller's verified status after admin review. Requires MANAGE_USERS. */
export const VERIFY_SELLER = gql`
  ${SELLER_FIELDS_FRAGMENT}
  mutation VerifySeller($id: ID!, $language: Language!) {
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
  mutation BanSeller($id: ID!, $input: BanSellerInput!, $language: Language!) {
    banSeller(id: $id, input: $input, language: $language) {
      ...SellerFields
    }
  }
`;

/**
 * Approve a business after onboarding review so it can sign in (from PENDING,
 * or REJECTED after a follow-up). Emails the business. Requires MANAGE_USERS.
 * Returns the profile too, since the review state lives on it.
 */
export const APPROVE_BUSINESS = gql`
  ${SELLER_FIELDS_FRAGMENT}
  ${BUSINESS_PROFILE_FIELDS_FRAGMENT}
  mutation ApproveBusiness($id: ID!, $language: Language!) {
    approveBusiness(id: $id, language: $language) {
      ...SellerFields
      profile {
        ... on BusinessProfile {
          ...BusinessProfileFields
        }
      }
    }
  }
`;

/** Reject a PENDING application; `reason` (>= 10 chars) is emailed to the business. */
export const REJECT_BUSINESS = gql`
  ${SELLER_FIELDS_FRAGMENT}
  ${BUSINESS_PROFILE_FIELDS_FRAGMENT}
  mutation RejectBusiness($id: ID!, $reason: String!, $language: Language!) {
    rejectBusiness(id: $id, reason: $reason, language: $language) {
      ...SellerFields
      profile {
        ... on BusinessProfile {
          ...BusinessProfileFields
        }
      }
    }
  }
`;

/** Lift an active ban and reactivate the account. Requires BAN_USERS. */
export const REINSTATE_SELLER = gql`
  ${SELLER_FIELDS_FRAGMENT}
  mutation ReinstateSeller($id: ID!, $language: Language!, $unbanReason: String) {
    reinstateSeller(id: $id, language: $language, unbanReason: $unbanReason) {
      ...SellerFields
    }
  }
`;

// ─── Sellers workbook import (one mutation per sheet) ───────────────────────
const SELLERS_BULK_RESULT = `
  created
  createdIds
  updated
  failed
  errors {
    index
    id
    message
  }
`;

export const BULK_UPSERT_SELLERS = gql`
  mutation BulkUpsertSellers($rows: [SellerUpsertRowInput!]!) {
    bulkUpsertSellers(rows: $rows) {${SELLERS_BULK_RESULT}}
  }
`;

export const BULK_UPSERT_PERSON_PROFILES = gql`
  mutation BulkUpsertPersonProfiles($rows: [PersonProfileUpsertRowInput!]!) {
    bulkUpsertPersonProfiles(rows: $rows) {${SELLERS_BULK_RESULT}}
  }
`;

export const BULK_UPSERT_BUSINESS_PROFILES = gql`
  mutation BulkUpsertBusinessProfiles($rows: [BusinessProfileUpsertRowInput!]!) {
    bulkUpsertBusinessProfiles(rows: $rows) {${SELLERS_BULK_RESULT}}
  }
`;

export const BULK_UPSERT_SELLER_PREFERENCES = gql`
  mutation BulkUpsertSellerPreferences($rows: [SellerPreferencesUpsertRowInput!]!) {
    bulkUpsertSellerPreferences(rows: $rows) {${SELLERS_BULK_RESULT}}
  }
`;
