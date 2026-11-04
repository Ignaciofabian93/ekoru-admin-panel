import { gql } from "@apollo/client";

// The bookings and quote requests a service business received, for its panel
// team (USR-15). ekoru-services answers the `myProvider*` lists for a business
// account with MANAGE_BUSINESS_ORDERS as its store; ekoru-users shows the
// client's contact to the provider.
const CLIENT = `
  client {
    id
    email
    phone
    profile {
      ... on PersonProfile {
        id
        displayName
        firstName
        lastName
      }
      ... on BusinessProfile {
        id
        businessName
      }
    }
  }
`;

const PAGE_INFO = `
  pageInfo {
    currentPage
    totalPages
    totalCount
    hasNextPage
    hasPreviousPage
  }
`;

export const BUSINESS_BOOKINGS = gql`
  query BusinessBookings($page: Int, $pageSize: Int, $status: String) {
    myProviderBookings(page: $page, pageSize: $pageSize, status: $status) {
      nodes {
        id
        scheduledDate
        scheduledTimeSlot
        agreedPrice
        status
        clientNotes
        providerNotes
        cancellationReason
        completedAt
        createdAt
        service {
          id
          name
        }
        ${CLIENT}
      }
      ${PAGE_INFO}
    }
  }
`;

export const BUSINESS_QUOTATIONS = gql`
  query BusinessQuotations($page: Int, $pageSize: Int) {
    myProviderQuotations(page: $page, pageSize: $pageSize) {
      nodes {
        id
        title
        description
        estimatedPrice
        finalPrice
        estimatedDuration
        status
        clientNotes
        providerNotes
        declineReason
        paidAt
        createdAt
        service {
          id
          name
        }
        ${CLIENT}
      }
      ${PAGE_INFO}
    }
  }
`;
