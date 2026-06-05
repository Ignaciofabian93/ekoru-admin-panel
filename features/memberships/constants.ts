import type { BusinessSubscriptionPlan, PersonSubscriptionPlan } from "@/types/enums";
import type { MembershipKind } from "./types";

export const PERSON_PLANS: PersonSubscriptionPlan[] = ["FREEMIUM", "BASIC", "ADVANCED"];

export const BUSINESS_PLANS: BusinessSubscriptionPlan[] = [
  "FREEMIUM",
  "STARTUP",
  "BASIC",
  "ADVANCED",
  "EXPERT",
];

export const plansForKind = (kind: MembershipKind): string[] =>
  kind === "person" ? PERSON_PLANS : BUSINESS_PLANS;
