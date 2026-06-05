"use client";

import { useQuery } from "@apollo/client/react";
import { SELLER_LABELS } from "@/graphql/seller-labels/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { SellerLabelsResult } from "../types";

export function useSellerLabels() {
  const language = useGqlLanguage();
  const { data, loading, error, refetch } = useQuery<SellerLabelsResult>(SELLER_LABELS, {
    variables: { language },
    notifyOnNetworkStatusChange: true,
  });
  return { labels: data?.sellerLabels ?? [], loading, error, refetch };
}
