import { gql } from "@apollo/client";

// The panel's password links (USR-15, ekoru-users BusinessTeamResolver). Both
// are public: the reset request answers true whatever the address.
export const REQUEST_ADMIN_PASSWORD_RESET = gql`
  mutation RequestAdminPasswordReset($email: String!, $language: Language) {
    requestAdminPasswordReset(email: $email, language: $language)
  }
`;

export const SET_ADMIN_PASSWORD = gql`
  mutation SetAdminPassword($token: String!, $newPassword: String!, $language: Language) {
    setAdminPassword(token: $token, newPassword: $newPassword, language: $language)
  }
`;
