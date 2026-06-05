"use client";

import { useQuery } from "@apollo/client/react";
import { SELLER_LEVEL } from "@/graphql/seller-levels/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { SellerLevelResult } from "../types";

export function useSellerLevelDetail(id: number) {
  const language = useGqlLanguage();
  const { data, loading, error, refetch } = useQuery<SellerLevelResult>(SELLER_LEVEL, {
    variables: { id, language },
    skip: Number.isNaN(id),
    notifyOnNetworkStatusChange: true,
  });
  return { level: data?.sellerLevel ?? null, loading, error, refetch };
}
