import { gql } from "@apollo/client";

import {
  BUSINESS_PROFILE_FIELDS_FRAGMENT,
  PERSON_PROFILE_FIELDS_FRAGMENT,
  SELLER_FIELDS_FRAGMENT,
} from "./fragments";

// NOTE: `getSeller` is seller-gated on the backend (resolves via @CurrentSeller),
// so a PLATFORM admin without a sellerId gets "unauthorized". The admin list
// query `getSellers` already returns full seller nodes, so the panel reads
// detail from there instead of calling this. Kept schema-correct for the day
// the backend allows admin reads without a seller context.
export const GET_SELLER = gql`
  ${SELLER_FIELDS_FRAGMENT}
  ${PERSON_PROFILE_FIELDS_FRAGMENT}
  ${BUSINESS_PROFILE_FIELDS_FRAGMENT}
  query getSeller($id: ID!, $language: Language!) {
    getSeller(id: $id, language: $language) {
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
    $sellerType: SellerType
    $isActive: Boolean
    $isVerified: Boolean
    $approvalStatus: BusinessApprovalStatus
  ) {
    getSellers(
      language: $language
      page: $page
      pageSize: $pageSize
      searchQuery: $searchQuery
      sellerType: $sellerType
      isActive: $isActive
      isVerified: $isVerified
      approvalStatus: $approvalStatus
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
            approvalStatus
            applicationMessage
            rejectionReason
            reviewedAt
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

// ─── Sellers workbook (export / import round trip) ──────────────────────────
// Every column as stored, profiles and preferences included, for the XLSX
// backup and bulk edits. Admins with MANAGE_USERS. Passwords never leave users.
export const RAW_SELLERS = gql`
  query RawSellers($page: Int!, $pageSize: Int!, $ids: [ID!], $search: String) {
    rawSellers(page: $page, pageSize: $pageSize, ids: $ids, search: $search) {
      nodes {
        id
        email
        sellerType
        isActive
        isVerified
        points
        sellerLevelId
        phone
        address
        website
        preferredContactMethod
        socialMediaLinks
        countryId
        regionId
        cityId
        countyId
        contentLanguage
        lastLoginAt
        createdAt
        updatedAt
        personProfile {
          firstName
          lastName
          displayName
          bio
          birthday
          profileImage
          coverImage
          allowExchanges
        }
        businessProfile {
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
          approvalStatus
          applicationMessage
          reviewedAt
          reviewedById
          rejectionReason
        }
        preferences {
          enableEmailNotifications
          enablePushNotifications
          showMySocials
          showMyAddress
          enableTwoFactorAuth
          enableLoginAlerts
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;
