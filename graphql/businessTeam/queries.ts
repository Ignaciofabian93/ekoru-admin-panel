import { gql } from "@apollo/client";

// A business's own panel accounts (USR-15, ekoru-users BusinessTeamResolver).
export const BUSINESS_TEAM_MEMBER_FIELDS = gql`
  fragment BusinessTeamMemberFields on BusinessTeamMember {
    id
    email
    name
    lastName
    role
    permissions
    isActive
    hasSeat
    lastLoginAt
    createdAt
  }
`;

export const MY_BUSINESS_TEAM = gql`
  ${BUSINESS_TEAM_MEMBER_FIELDS}
  query MyBusinessTeam($language: Language) {
    myBusinessTeam(language: $language) {
      plan
      seats
      used
      members {
        ...BusinessTeamMemberFields
      }
    }
  }
`;
