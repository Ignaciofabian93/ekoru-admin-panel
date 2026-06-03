import type {
  BusinessSubscriptionPlan,
  BusinessType,
  ContactMethod,
  PersonSubscriptionPlan,
  SellerType,
} from "./enums";
import type { City, Country, County, Region } from "./location";

/**
 * A seller account — the primary entity platform admins manage. Each seller
 * has exactly ONE profile (person or business) keyed off `sellerType`.
 */
export type Seller = {
  id: string;
  email: string;
  sellerType: SellerType;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Optional because partial GraphQL projections may omit it.
  profile?: PersonProfile | BusinessProfile | null;

  // Location
  address?: string | null;
  cityId?: number;
  countryId?: number;
  countyId?: number;
  regionId?: number;
  county?: County | null;
  region?: Region | null;
  country?: Country | null;
  city?: City | null;

  // Contact
  phone?: string | null;
  website?: string | null;
  preferredContactMethod?: ContactMethod;
  socialMediaLinks?: Record<string, string>;

  // Points
  points?: number;
};

export type PersonProfile = {
  __typename: "PersonProfile";
  id: string;
  sellerId?: string;
  firstName: string;
  lastName?: string | null;
  displayName?: string | null;
  bio?: string | null;
  birthday?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
  allowExchanges?: boolean;
  personSubscriptionPlan?: PersonSubscriptionPlan;
};

export type BusinessProfile = {
  __typename: "BusinessProfile";
  id: string;
  sellerId?: string;

  businessName: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  businessType?: BusinessType;

  legalBusinessName?: string | null;
  taxId?: string | null;
  businessStartDate?: string | null;
  legalRepresentative?: string | null;
  legalRepresentativeTaxId?: string | null;

  shippingPolicy?: string | null;
  returnPolicy?: string | null;

  serviceArea?: string | null;
  yearsOfExperience?: number | null;
  certifications?: string[];
  travelRadius?: number | null;

  businessHours?: Record<string, unknown> | null;

  businessSubscriptionPlan?: BusinessSubscriptionPlan;
  createdAt?: string;
  updatedAt?: string;
};
