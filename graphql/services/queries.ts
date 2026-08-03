import { gql } from "@apollo/client";

// Admin-only raw reads over Service (ekoru-services AdminServicesResolver).
// Returns the whole catalog exactly as stored — inactive included — each service
// carrying its media + FAQ. Source of truth for the CRUD screens and the XLSX
// export.

const SERVICE_FIELDS = gql`
  fragment AdminServiceFields on AdminService {
    id
    name
    description
    sellerId
    pricingType
    basePrice
    priceRange
    duration
    isActive
    images
    tags
    subcategoryId
    maxConcurrentBookings
    advanceBookingDays
    serviceRadius
    isRemoteService
    isCurrentlyAvailable
    averageRating
    viewCount
    createdAt
    updatedAt
    serviceMedia {
      id
      serviceId
      mediaType
      url
      title
      description
      displayOrder
      isPortfolio
      isCertificate
    }
    serviceFAQ {
      id
      serviceId
      subcategoryId
      question
      answer
      displayOrder
      isActive
    }
  }
`;

export const GET_RAW_SERVICES = gql`
  ${SERVICE_FIELDS}
  query RawServices(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $subcategoryId: Int
    $sellerId: String
    $isActive: Boolean
  ) {
    rawServices(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      subcategoryId: $subcategoryId
      sellerId: $sellerId
      isActive: $isActive
    ) {
      nodes {
        ...AdminServiceFields
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
