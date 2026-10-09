import { gql } from "@apollo/client";

// Admin-only writes over community events. All require a platform admin
// (adminId from the x-admin-id header the gateway sets). Registrations are
// created by the web app — the panel can only remove them. Mirrors
// CommunityEventResolver.

export const CREATE_COMMUNITY_EVENT = gql`
  mutation CreateCommunityEvent($input: CreateCommunityEventInput!) {
    createCommunityEvent(input: $input) {
      id
    }
  }
`;

export const UPDATE_COMMUNITY_EVENT = gql`
  mutation UpdateCommunityEvent($id: Int!, $input: UpdateCommunityEventInput!) {
    updateCommunityEvent(id: $id, input: $input) {
      id
    }
  }
`;

export const CANCEL_COMMUNITY_EVENT = gql`
  mutation CancelCommunityEvent($id: Int!, $reason: String) {
    cancelCommunityEvent(id: $id, reason: $reason) {
      id
      status
    }
  }
`;

export const DELETE_COMMUNITY_EVENT = gql`
  mutation DeleteCommunityEvent($id: Int!) {
    deleteCommunityEvent(id: $id)
  }
`;

export const DELETE_COMMUNITY_REGISTRATION = gql`
  mutation DeleteCommunityRegistration($id: Int!) {
    deleteCommunityRegistration(id: $id)
  }
`;

export const RESOLVE_COMMUNITY_EVENT_REPORT = gql`
  mutation ResolveCommunityEventReport(
    $id: Int!
    $action: CommunityReportAction!
    $note: String
  ) {
    resolveCommunityEventReport(id: $id, action: $action, note: $note) {
      id
      status
    }
  }
`;
