import { gql } from "@apollo/client";

import { ADMIN_FIELDS_FRAGMENT } from "@/graphql/admin/auth";

// Admin management is gated to PLATFORM admins holding MANAGE_ADMINS. Mirrors the
// AdminsResolver in ekoru-users (getAdmins / getAdmin).
export const LIST_ADMINS = gql`
  ${ADMIN_FIELDS_FRAGMENT}
  query GetAdmins(
    $language: Language
    $adminType: AdminType
    $role: AdminRole
    $isActive: Boolean
    $page: Int
    $pageSize: Int
  ) {
    getAdmins(
      language: $language
      adminType: $adminType
      role: $role
      isActive: $isActive
      page: $page
      pageSize: $pageSize
    ) {
      nodes {
        ...AdminFields
      }
      pageInfo {
        totalCount
        totalPages
        currentPage
        pageSize
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_ADMIN = gql`
  ${ADMIN_FIELDS_FRAGMENT}
  query GetAdmin($id: ID!, $language: Language) {
    getAdmin(id: $id, language: $language) {
      ...AdminFields
    }
  }
`;
