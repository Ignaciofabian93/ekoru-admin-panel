import { gql } from "@apollo/client";

import {
  BUSINESS_PROFILE_FIELDS_FRAGMENT,
  PERSON_PROFILE_FIELDS_FRAGMENT,
  SELLER_FIELDS_FRAGMENT,
} from "./fragments";

// Admin-scoped listing. The gateway is expected to authorize PLATFORM admins
// for the full list; align argument/field names with the actual admin schema.
export const LIST_SELLERS = gql`
  ${SELLER_FIELDS_FRAGMENT}
  ${PERSON_PROFILE_FIELDS_FRAGMENT}
  ${BUSINESS_PROFILE_FIELDS_FRAGMENT}
  query AdminListSellers($search: String, $limit: Int, $offset: Int) {
    adminSellers(search: $search, limit: $limit, offset: $offset) {
      items {
        ...SellerFields
        profile {
          ... on PersonProfile {
            ...PersonProfileFields
          }
          ... on BusinessProfile {
            ...BusinessProfileFields
          }
        }
      }
      total
    }
  }
`;

export const GET_SELLER = gql`
  ${SELLER_FIELDS_FRAGMENT}
  ${PERSON_PROFILE_FIELDS_FRAGMENT}
  ${BUSINESS_PROFILE_FIELDS_FRAGMENT}
  query AdminGetSeller($id: ID!) {
    adminSeller(id: $id) {
      ...SellerFields
      profile {
        ... on PersonProfile {
          ...PersonProfileFields
        }
        ... on BusinessProfile {
          ...BusinessProfileFields
        }
      }
    }
  }
`;

export const GET_SELLERS = gql`
  query getSellers(
    $language: Language!
    $page: Int!
    $pageSize: Int!
    $searchQuery: String
    $sellerType: String
    $isActive: Boolean
    $isVerified: Boolean
  ) {
    getSellers(
      language: $language
      page: $page
      pageSize: $pageSize
      searchQuery: $searchQuery
      sellerType: $sellerType
      isActive: $isActive
      isVerified: $isVerified
    ) {
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        pageSize
      }
      nodes {
        id
        email
        sellerType
        isActive
        isVerified
        createdAt
        updatedAt
        address
        phone
        website
        preferredContactMethod
        socialMediaLinks
        points
        profile {
          ... on BusinessProfile {
            id
            sellerId
            businessName
            description
            logo
            coverImage
            businessType
            legalBusinessName
            taxId
            businessStartDate
            legalRepresentative
            legalRepresentativeTaxId
            shippingPolicy
            returnPolicy
            serviceArea
            yearsOfExperience
            certifications
            travelRadius
            businessHours
            createdAt
            updatedAt
            businessMembershipSubscriptionId
          }
          ... on PersonProfile {
            id
            sellerId
            firstName
            lastName
            displayName
            bio
            birthday
            profileImage
            coverImage
            allowExchanges
            personMembershipSubscriptionId
          }
        }
        sellerLevel {
          id
          levelName
          minPoints
          maxPoints
          benefits
          badgeIcon
          createdAt
          updatedAt
        }
        country {
          id
          country
          createdAt
          updatedAt
        }
        region {
          id
          region
          countryId
        }
        city {
          id
          city
          regionId
        }
        county {
          id
          county
          cityId
        }
      }
    }
  }
`;
