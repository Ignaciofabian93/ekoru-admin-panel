import type { BusinessSubscriptionPlan, Language, PersonSubscriptionPlan } from "./enums";

// Memberships mirror the GraphQL entities in ekoru-users (src/subscription/entities/*).
// NOTE: the schema exposes `translation`/`pricing` as SINGULAR fields resolved by the
// `language`/`countryId` arguments — there is no plural collection. The admin UI reads
// all translations via aliased per-language queries and manages pricing per country.

export type PersonMembershipTranslation = {
  id: number;
  personMembershipId: number;
  language: Language;
  name: string;
  description: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type PersonMembershipPricing = {
  id: number;
  personMembershipId: number;
  countryId: number;
  currency: string;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PersonMembership = {
  id: number;
  membershipType: PersonSubscriptionPlan;
  durationMonths: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  translation?: PersonMembershipTranslation | null;
  pricing?: PersonMembershipPricing | null;
};

export type BusinessMembershipTranslation = {
  id: number;
  businessMembershipId: number;
  language: Language;
  name: string;
  description: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type BusinessMembershipPricing = {
  id: number;
  businessMembershipId: number;
  countryId: number;
  currency: string;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BusinessMembership = {
  id: number;
  membershipType: BusinessSubscriptionPlan;
  durationMonths: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  translation?: BusinessMembershipTranslation | null;
  pricing?: BusinessMembershipPricing | null;
};
