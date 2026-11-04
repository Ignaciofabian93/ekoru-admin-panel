"use client";

import { useQuery } from "@apollo/client/react";
import { GET_SELLER } from "@/graphql/sellers/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useScopedSellerId } from "@/store/useAuthStore";
import type { CatalogKind } from "../catalog";

/** What each business type publishes, as on the web (WEB-22). */
const KINDS_BY_TYPE: Record<string, CatalogKind[]> = {
  RETAIL: ["products"],
  SERVICES: ["services"],
  MIXED: ["products", "services"],
};

/**
 * The catalogs the signed-in business keeps: store products, services or
 * both, from its business type. Empty for a platform admin.
 */
export function useBusinessKinds() {
  const sellerId = useScopedSellerId();
  const language = useGqlLanguage();
  const { data, loading } = useQuery<{
    getSeller: { profile?: { businessType?: string | null } | null } | null;
  }>(GET_SELLER, { variables: { id: sellerId, language }, skip: !sellerId });

  return {
    sellerId,
    loading: loading && !data,
    kinds: KINDS_BY_TYPE[data?.getSeller?.profile?.businessType ?? ""] ?? [],
  };
}
