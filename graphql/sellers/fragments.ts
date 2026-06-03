import { gql } from "@apollo/client";

export const PERSON_PROFILE_FIELDS_FRAGMENT = gql`
  fragment PersonProfileFields on PersonProfile {
    id
    sellerId
    firstName
    lastName
    displayName
    bio
    profileImage
    coverImage
    allowExchanges
  }
`;

export const BUSINESS_PROFILE_FIELDS_FRAGMENT = gql`
  fragment BusinessProfileFields on BusinessProfile {
    id
    sellerId
    businessName
    description
    logo
    coverImage
    businessType
    legalBusinessName
    taxId
    createdAt
    updatedAt
  }
`;

export const SELLER_FIELDS_FRAGMENT = gql`
  fragment SellerFields on Seller {
    id
    email
    sellerType
    isActive
    isVerified
    phone
    website
    points
    createdAt
    updatedAt
  }
`;
