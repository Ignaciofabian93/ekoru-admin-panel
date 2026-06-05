"use client";

import { useQuery } from "@apollo/client/react";
import { SELLER_LEVELS } from "@/graphql/seller-levels/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { SellerLevelsResult } from "../types";

export function useSellerLevels() {
  const language = useGqlLanguage();
  const { data, loading, error, refetch } = useQuery<SellerLevelsResult>(SELLER_LEVELS, {
    variables: { language },
    notifyOnNetworkStatusChange: true,
  });
  return { levels: data?.sellerLevels ?? [], loading, error, refetch };
}
