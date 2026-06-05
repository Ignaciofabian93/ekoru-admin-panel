import {
  BUSINESS_MEMBERSHIP,
  BUSINESS_MEMBERSHIP_PRICING,
  BUSINESS_MEMBERSHIP_TRANSLATIONS,
  BUSINESS_MEMBERSHIPS,
  PERSON_MEMBERSHIP,
  PERSON_MEMBERSHIP_PRICING,
  PERSON_MEMBERSHIP_TRANSLATIONS,
  PERSON_MEMBERSHIPS,
} from "@/graphql/memberships/queries";
import {
  CREATE_BUSINESS_MEMBERSHIP,
  CREATE_PERSON_MEMBERSHIP,
  DELETE_BUSINESS_MEMBERSHIP,
  DELETE_BUSINESS_MEMBERSHIP_PRICING,
  DELETE_BUSINESS_MEMBERSHIP_TRANSLATION,
  DELETE_PERSON_MEMBERSHIP,
  DELETE_PERSON_MEMBERSHIP_PRICING,
  DELETE_PERSON_MEMBERSHIP_TRANSLATION,
  UPDATE_BUSINESS_MEMBERSHIP,
  UPDATE_PERSON_MEMBERSHIP,
  UPSERT_BUSINESS_MEMBERSHIP_PRICING,
  UPSERT_BUSINESS_MEMBERSHIP_TRANSLATION,
  UPSERT_PERSON_MEMBERSHIP_PRICING,
  UPSERT_PERSON_MEMBERSHIP_TRANSLATION,
} from "@/graphql/memberships/mutations";
import type { MembershipKind } from "./types";

/** Per-kind operation + response-key registry so the hooks stay kind-agnostic. */
export const membershipOps = {
  person: {
    listQuery: PERSON_MEMBERSHIPS,
    detailQuery: PERSON_MEMBERSHIP,
    translationsQuery: PERSON_MEMBERSHIP_TRANSLATIONS,
    pricingQuery: PERSON_MEMBERSHIP_PRICING,
    listKey: "personMemberships",
    detailKey: "personMembership",
    idField: "personMembershipId",
    create: CREATE_PERSON_MEMBERSHIP,
    update: UPDATE_PERSON_MEMBERSHIP,
    remove: DELETE_PERSON_MEMBERSHIP,
    upsertTranslation: UPSERT_PERSON_MEMBERSHIP_TRANSLATION,
    deleteTranslation: DELETE_PERSON_MEMBERSHIP_TRANSLATION,
    upsertPricing: UPSERT_PERSON_MEMBERSHIP_PRICING,
    deletePricing: DELETE_PERSON_MEMBERSHIP_PRICING,
  },
  business: {
    listQuery: BUSINESS_MEMBERSHIPS,
    detailQuery: BUSINESS_MEMBERSHIP,
    translationsQuery: BUSINESS_MEMBERSHIP_TRANSLATIONS,
    pricingQuery: BUSINESS_MEMBERSHIP_PRICING,
    listKey: "businessMemberships",
    detailKey: "businessMembership",
    idField: "businessMembershipId",
    create: CREATE_BUSINESS_MEMBERSHIP,
    update: UPDATE_BUSINESS_MEMBERSHIP,
    remove: DELETE_BUSINESS_MEMBERSHIP,
    upsertTranslation: UPSERT_BUSINESS_MEMBERSHIP_TRANSLATION,
    deleteTranslation: DELETE_BUSINESS_MEMBERSHIP_TRANSLATION,
    upsertPricing: UPSERT_BUSINESS_MEMBERSHIP_PRICING,
    deletePricing: DELETE_BUSINESS_MEMBERSHIP_PRICING,
  },
} as const;

export const MEMBERSHIP_KINDS: MembershipKind[] = ["person", "business"];

export const isMembershipKind = (v: string): v is MembershipKind =>
  v === "person" || v === "business";
