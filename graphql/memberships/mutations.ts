import { gql } from "@apollo/client";

// Membership mutations are admin-only. Field-arg names differ (personMembershipId
// vs businessMembershipId) but variables are normalized to `$id` so the unified
// hooks can stay kind-agnostic.

// ─── Person ───────────────────────────────────────────────────────────────────
export const CREATE_PERSON_MEMBERSHIP = gql`
  mutation CreatePersonMembership(
    $input: CreatePersonMembershipInput!
    $language: Language
  ) {
    createPersonMembership(input: $input, language: $language) {
      id
      membershipType
      durationMonths
      isActive
    }
  }
`;

export const UPDATE_PERSON_MEMBERSHIP = gql`
  mutation UpdatePersonMembership(
    $id: Int!
    $input: UpdatePersonMembershipInput!
    $language: Language
  ) {
    updatePersonMembership(id: $id, input: $input, language: $language) {
      id
      membershipType
      durationMonths
      isActive
    }
  }
`;

export const DELETE_PERSON_MEMBERSHIP = gql`
  mutation DeletePersonMembership($id: Int!, $language: Language) {
    deletePersonMembership(id: $id, language: $language) {
      id
      isActive
    }
  }
`;

export const UPSERT_PERSON_MEMBERSHIP_TRANSLATION = gql`
  mutation UpsertPersonMembershipTranslation(
    $input: UpsertPersonMembershipTranslationInput!
    $language: Language
  ) {
    upsertPersonMembershipTranslation(input: $input, language: $language) {
      id
      personMembershipId
      language
      name
      description
    }
  }
`;

export const DELETE_PERSON_MEMBERSHIP_TRANSLATION = gql`
  mutation DeletePersonMembershipTranslation(
    $id: Int!
    $translationLanguage: Language!
    $language: Language
  ) {
    deletePersonMembershipTranslation(
      personMembershipId: $id
      translationLanguage: $translationLanguage
      language: $language
    ) {
      id
    }
  }
`;

export const UPSERT_PERSON_MEMBERSHIP_PRICING = gql`
  mutation UpsertPersonMembershipPricing(
    $input: UpsertPersonMembershipPricingInput!
    $language: Language
  ) {
    upsertPersonMembershipPricing(input: $input, language: $language) {
      id
      personMembershipId
      countryId
      currency
      price
      isActive
    }
  }
`;

export const DELETE_PERSON_MEMBERSHIP_PRICING = gql`
  mutation DeletePersonMembershipPricing(
    $id: Int!
    $countryId: Int!
    $language: Language
  ) {
    deletePersonMembershipPricing(
      personMembershipId: $id
      countryId: $countryId
      language: $language
    ) {
      id
    }
  }
`;

// ─── Business ─────────────────────────────────────────────────────────────────
export const CREATE_BUSINESS_MEMBERSHIP = gql`
  mutation CreateBusinessMembership(
    $input: CreateBusinessMembershipInput!
    $language: Language
  ) {
    createBusinessMembership(input: $input, language: $language) {
      id
      membershipType
      durationMonths
      isActive
    }
  }
`;

export const UPDATE_BUSINESS_MEMBERSHIP = gql`
  mutation UpdateBusinessMembership(
    $id: Int!
    $input: UpdateBusinessMembershipInput!
    $language: Language
  ) {
    updateBusinessMembership(id: $id, input: $input, language: $language) {
      id
      membershipType
      durationMonths
      isActive
    }
  }
`;

export const DELETE_BUSINESS_MEMBERSHIP = gql`
  mutation DeleteBusinessMembership($id: Int!, $language: Language) {
    deleteBusinessMembership(id: $id, language: $language) {
      id
      isActive
    }
  }
`;

export const UPSERT_BUSINESS_MEMBERSHIP_TRANSLATION = gql`
  mutation UpsertBusinessMembershipTranslation(
    $input: UpsertBusinessMembershipTranslationInput!
    $language: Language
  ) {
    upsertBusinessMembershipTranslation(input: $input, language: $language) {
      id
      businessMembershipId
      language
      name
      description
    }
  }
`;

export const DELETE_BUSINESS_MEMBERSHIP_TRANSLATION = gql`
  mutation DeleteBusinessMembershipTranslation(
    $id: Int!
    $translationLanguage: Language!
    $language: Language
  ) {
    deleteBusinessMembershipTranslation(
      businessMembershipId: $id
      translationLanguage: $translationLanguage
      language: $language
    ) {
      id
    }
  }
`;

export const UPSERT_BUSINESS_MEMBERSHIP_PRICING = gql`
  mutation UpsertBusinessMembershipPricing(
    $input: UpsertBusinessMembershipPricingInput!
    $language: Language
  ) {
    upsertBusinessMembershipPricing(input: $input, language: $language) {
      id
      businessMembershipId
      countryId
      currency
      price
      isActive
    }
  }
`;

export const DELETE_BUSINESS_MEMBERSHIP_PRICING = gql`
  mutation DeleteBusinessMembershipPricing(
    $id: Int!
    $countryId: Int!
    $language: Language
  ) {
    deleteBusinessMembershipPricing(
      businessMembershipId: $id
      countryId: $countryId
      language: $language
    ) {
      id
    }
  }
`;
