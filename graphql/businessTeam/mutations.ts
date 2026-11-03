import { gql } from "@apollo/client";
import { BUSINESS_TEAM_MEMBER_FIELDS } from "./queries";

export const INVITE_BUSINESS_ADMIN = gql`
  ${BUSINESS_TEAM_MEMBER_FIELDS}
  mutation InviteBusinessAdmin($input: InviteBusinessAdminInput!, $language: Language) {
    inviteBusinessAdmin(input: $input, language: $language) {
      ...BusinessTeamMemberFields
    }
  }
`;

export const UPDATE_BUSINESS_ADMIN = gql`
  ${BUSINESS_TEAM_MEMBER_FIELDS}
  mutation UpdateBusinessAdmin(
    $id: ID!
    $input: UpdateBusinessAdminInput!
    $language: Language
  ) {
    updateBusinessAdmin(id: $id, input: $input, language: $language) {
      ...BusinessTeamMemberFields
    }
  }
`;

export const SET_BUSINESS_ADMIN_ACTIVE = gql`
  ${BUSINESS_TEAM_MEMBER_FIELDS}
  mutation SetBusinessAdminActive($id: ID!, $isActive: Boolean!, $language: Language) {
    setBusinessAdminActive(id: $id, isActive: $isActive, language: $language) {
      ...BusinessTeamMemberFields
    }
  }
`;

export const RESEND_BUSINESS_ADMIN_INVITE = gql`
  mutation ResendBusinessAdminInvite($id: ID!, $language: Language) {
    resendBusinessAdminInvite(id: $id, language: $language)
  }
`;
