"use client";

import { useQuery } from "@apollo/client/react";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { BackendLanguage } from "@/utils/language";
import { membershipOps } from "../registry";
import type {
  Membership,
  MembershipDetailResult,
  MembershipKind,
  MembershipPricing,
  MembershipPricingResult,
  MembershipsResult,
  MembershipTranslation,
  MembershipTranslationsAliasResult,
} from "../types";

/** List of person or business membership plans. */
export function useMemberships(kind: MembershipKind) {
  const language = useGqlLanguage();
  const ops = membershipOps[kind];
  const { data, loading, error, refetch } = useQuery<MembershipsResult>(ops.listQuery, {
    variables: { language },
    notifyOnNetworkStatusChange: true,
  });
  return {
    memberships: (data?.[ops.listKey] ?? []) as Membership[],
    loading,
    error,
    refetch,
  };
}

/** A single membership's core fields (+ active-language translation). */
export function useMembershipDetail(kind: MembershipKind, id: number) {
  const language = useGqlLanguage();
  const ops = membershipOps[kind];
  const { data, loading, error, refetch } = useQuery<MembershipDetailResult>(
    ops.detailQuery,
    {
      variables: { id, language },
      skip: Number.isNaN(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    membership: (data?.[ops.detailKey] ?? null) as Membership | null,
    loading,
    error,
    refetch,
  };
}

/** All translations for a membership, read via per-language aliases. */
export function useMembershipTranslations(kind: MembershipKind, id: number) {
  const ops = membershipOps[kind];
  const { data, loading, refetch } = useQuery<MembershipTranslationsAliasResult>(
    ops.translationsQuery,
    {
      variables: { id },
      skip: Number.isNaN(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  const translations: Record<BackendLanguage, MembershipTranslation | null> = {
    ES: data?.es?.translation ?? null,
    EN: data?.en?.translation ?? null,
    FR: data?.fr?.translation ?? null,
  };
  return { translations, loading, refetch };
}

/** The pricing row for a membership in a given country (skips with no country). */
export function useMembershipPricing(
  kind: MembershipKind,
  id: number,
  countryId?: number,
) {
  const ops = membershipOps[kind];
  const { data, loading, refetch } = useQuery<MembershipPricingResult>(ops.pricingQuery, {
    variables: { id, countryId },
    skip: countryId == null || Number.isNaN(id),
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const node = data?.[ops.detailKey];
  return {
    pricing: (node?.pricing ?? null) as MembershipPricing | null,
    loading,
    refetch,
  };
}
