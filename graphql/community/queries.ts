import { gql } from "@apollo/client";

// Admin-only reads over community events (ekoru-blog-community
// CommunityEventResolver). Events are single-language; registrations are
// written by the web app and only listed/removed here.

const COMMUNITY_EVENT_FIELDS = gql`
  fragment AdminCommunityEventFields on AdminCommunityEvent {
    id
    title
    content
    coverImage
    startDate
    endDate
    capacity
    registrationCount
    remainingCapacity
    likes
    authorId
    createdAt
    updatedAt
  }
`;

export const ADMIN_COMMUNITY_EVENTS = gql`
  ${COMMUNITY_EVENT_FIELDS}
  query AdminCommunityEvents($page: Int, $pageSize: Int, $search: String) {
    adminCommunityEvents(page: $page, pageSize: $pageSize, search: $search) {
      nodes {
        ...AdminCommunityEventFields
      }
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
        pageSize
      }
    }
  }
`;

export const ADMIN_COMMUNITY_EVENT = gql`
  ${COMMUNITY_EVENT_FIELDS}
  query AdminCommunityEvent($id: Int!) {
    adminCommunityEvent(id: $id) {
      ...AdminCommunityEventFields
    }
  }
`;

export const COMMUNITY_EVENT_REGISTRATIONS = gql`
  query CommunityEventRegistrations($eventId: Int!, $page: Int, $pageSize: Int) {
    communityEventRegistrations(eventId: $eventId, page: $page, pageSize: $pageSize) {
      nodes {
        id
        communityPostId
        name
        email
        sellerId
        createdAt
      }
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
        pageSize
      }
    }
  }
`;
