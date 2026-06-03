import { gql } from "@apollo/client";

// Field selection mirrors the `Admin` GraphQL entity in ekoru-users
// (src/admins/entities/admin.entity.ts).
export const ADMIN_FIELDS_FRAGMENT = gql`
  fragment AdminFields on Admin {
    id
    email
    name
    lastName
    adminType
    role
    permissions
    sellerId
    isActive
    isEmailVerified
    accountLocked
    lastLoginAt
    createdAt
    updatedAt
  }
`;

// The gateway resolves the current admin from the `adminId` in the JWT via the
// `getMyData` query (ekoru-users AdminsResolver). It returns null when the
// context has no adminId.
export const GET_ADMIN_ME = gql`
  ${ADMIN_FIELDS_FRAGMENT}
  query GetMyData {
    getMyData {
      ...AdminFields
    }
  }
`;
