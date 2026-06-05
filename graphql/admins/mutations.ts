import { gql } from "@apollo/client";

import { ADMIN_FIELDS_FRAGMENT } from "@/graphql/admin/auth";

// All admin mutations require MANAGE_ADMINS (SUPER_ADMIN passes). Names follow the
// AdminsResolver in ekoru-users.
export const CREATE_ADMIN = gql`
  ${ADMIN_FIELDS_FRAGMENT}
  mutation CreateAdmin($input: RegisterAdminInput!, $language: Language) {
    createAdmin(input: $input, language: $language) {
      ...AdminFields
    }
  }
`;

export const UPDATE_ADMIN = gql`
  ${ADMIN_FIELDS_FRAGMENT}
  mutation UpdateAdmin($id: ID!, $input: UpdateAdminInput!, $language: Language) {
    updateAdmin(id: $id, input: $input, language: $language) {
      ...AdminFields
    }
  }
`;

export const DELETE_ADMIN = gql`
  ${ADMIN_FIELDS_FRAGMENT}
  mutation DeleteAdmin($id: ID!, $language: Language) {
    deleteAdmin(id: $id, language: $language) {
      ...AdminFields
    }
  }
`;

export const TOGGLE_ADMIN_STATUS = gql`
  ${ADMIN_FIELDS_FRAGMENT}
  mutation ToggleAdminStatus($id: ID!, $isActive: Boolean!, $language: Language) {
    toggleAdminStatus(id: $id, isActive: $isActive, language: $language) {
      ...AdminFields
    }
  }
`;

export const ASSIGN_PERMISSIONS = gql`
  ${ADMIN_FIELDS_FRAGMENT}
  mutation AssignPermissions(
    $id: ID!
    $permissions: [AdminPermission!]!
    $language: Language
  ) {
    assignPermissions(id: $id, permissions: $permissions, language: $language) {
      ...AdminFields
    }
  }
`;
