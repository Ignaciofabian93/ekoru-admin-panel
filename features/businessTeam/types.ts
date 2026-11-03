import type { AdminPermission, AdminRole, BusinessSubscriptionPlan } from "@/types/enums";

export type BusinessTeamMember = {
  id: string;
  email: string;
  name: string;
  lastName: string | null;
  role: AdminRole;
  permissions: AdminPermission[];
  isActive: boolean;
  /** Active and within the plan's accounts: can sign in now. */
  hasSeat: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type BusinessTeam = {
  plan: BusinessSubscriptionPlan;
  seats: number;
  used: number;
  members: BusinessTeamMember[];
};

/** The roles an owner gives; there is one owner per business. */
export const TEAM_ROLES: AdminRole[] = [
  "BUSINESS_MANAGER",
  "BUSINESS_ANALYST",
  "BUSINESS_SUPPORT",
];

/** What each role starts with; the owner can change it. */
export const ROLE_PRESETS: Partial<Record<AdminRole, AdminPermission[]>> = {
  BUSINESS_MANAGER: [
    "MANAGE_BUSINESS_PROFILE",
    "MANAGE_BUSINESS_PRODUCTS",
    "MANAGE_BUSINESS_ORDERS",
    "VIEW_BUSINESS_ANALYTICS",
  ],
  BUSINESS_ANALYST: ["VIEW_BUSINESS_ANALYTICS"],
  BUSINESS_SUPPORT: ["MANAGE_BUSINESS_ORDERS"],
};

export type MemberDraft = {
  email: string;
  name: string;
  lastName: string;
  role: AdminRole;
  permissions: AdminPermission[];
};
