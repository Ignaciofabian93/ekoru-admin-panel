import type {
  BusinessMembership,
  BusinessMembershipPricing,
  BusinessMembershipTranslation,
  PersonMembership,
  PersonMembershipPricing,
  PersonMembershipTranslation,
} from "@/types/membership";

export type MembershipKind = "person" | "business";

export type Membership = PersonMembership | BusinessMembership;
export type MembershipTranslation =
  | PersonMembershipTranslation
  | BusinessMembershipTranslation;
export type MembershipPricing = PersonMembershipPricing | BusinessMembershipPricing;

export type MembershipsResult = {
  personMemberships?: Membership[];
  businessMemberships?: Membership[];
};

export type MembershipDetailResult = {
  personMembership?: Membership | null;
  businessMembership?: Membership | null;
};

export type MembershipTranslationsAliasResult = {
  es?: { translation: MembershipTranslation | null } | null;
  en?: { translation: MembershipTranslation | null } | null;
  fr?: { translation: MembershipTranslation | null } | null;
};

export type MembershipPricingResult = {
  personMembership?: { pricing: MembershipPricing | null } | null;
  businessMembership?: { pricing: MembershipPricing | null } | null;
};

export type CreateMembershipInput = { membershipType: string; durationMonths: number };
export type UpdateMembershipInput = {
  membershipType?: string;
  durationMonths?: number;
  isActive?: boolean;
};
