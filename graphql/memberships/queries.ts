import { gql } from "@apollo/client";

// Memberships mirror SubscriptionResolver in ekoru-users. The schema exposes
// `translation`/`pricing` as SINGULAR fields resolved by the language/countryId
// args, so the admin UI reads all translations via per-language aliases and reads
// pricing one country at a time. The aliased/pricing queries deliberately omit the
// parent `id` so Apollo keeps each result inline instead of overwriting a single
// normalized membership.

// ─── Person ───────────────────────────────────────────────────────────────────
export const PERSON_MEMBERSHIPS = gql`
  query PersonMemberships($language: Language) {
    personMemberships(language: $language) {
      id
      membershipType
      durationMonths
      isActive
      translation {
        id
        language
        name
        description
      }
    }
  }
`;

export const PERSON_MEMBERSHIP = gql`
  query PersonMembership($id: Int!, $language: Language) {
    personMembership(id: $id, language: $language) {
      id
      membershipType
      durationMonths
      isActive
      createdAt
      updatedAt
      translation {
        id
        personMembershipId
        language
        name
        description
      }
    }
  }
`;

export const PERSON_MEMBERSHIP_TRANSLATIONS = gql`
  query PersonMembershipTranslations($id: Int!) {
    es: personMembership(id: $id, language: ES) {
      translation {
        id
        personMembershipId
        language
        name
        description
      }
    }
    en: personMembership(id: $id, language: EN) {
      translation {
        id
        personMembershipId
        language
        name
        description
      }
    }
    fr: personMembership(id: $id, language: FR) {
      translation {
        id
        personMembershipId
        language
        name
        description
      }
    }
  }
`;

export const PERSON_MEMBERSHIP_PRICING = gql`
  query PersonMembershipPricing($id: Int!, $countryId: Int!) {
    personMembership(id: $id, countryId: $countryId) {
      pricing {
        id
        personMembershipId
        countryId
        currency
        price
        isActive
      }
    }
  }
`;

// ─── Business ─────────────────────────────────────────────────────────────────
export const BUSINESS_MEMBERSHIPS = gql`
  query BusinessMemberships($language: Language) {
    businessMemberships(language: $language) {
      id
      membershipType
      durationMonths
      isActive
      translation {
        id
        language
        name
        description
      }
    }
  }
`;

export const BUSINESS_MEMBERSHIP = gql`
  query BusinessMembership($id: Int!, $language: Language) {
    businessMembership(id: $id, language: $language) {
      id
      membershipType
      durationMonths
      isActive
      createdAt
      updatedAt
      translation {
        id
        businessMembershipId
        language
        name
        description
      }
    }
  }
`;

export const BUSINESS_MEMBERSHIP_TRANSLATIONS = gql`
  query BusinessMembershipTranslations($id: Int!) {
    es: businessMembership(id: $id, language: ES) {
      translation {
        id
        businessMembershipId
        language
        name
        description
      }
    }
    en: businessMembership(id: $id, language: EN) {
      translation {
        id
        businessMembershipId
        language
        name
        description
      }
    }
    fr: businessMembership(id: $id, language: FR) {
      translation {
        id
        businessMembershipId
        language
        name
        description
      }
    }
  }
`;

export const BUSINESS_MEMBERSHIP_PRICING = gql`
  query BusinessMembershipPricing($id: Int!, $countryId: Int!) {
    businessMembership(id: $id, countryId: $countryId) {
      pricing {
        id
        businessMembershipId
        countryId
        currency
        price
        isActive
      }
    }
  }
`;
