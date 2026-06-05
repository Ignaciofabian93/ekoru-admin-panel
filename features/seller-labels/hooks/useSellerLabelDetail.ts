"use client";

import { useQuery } from "@apollo/client/react";
import { SELLER_LABEL } from "@/graphql/seller-labels/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { SellerLabelResult } from "../types";

export function useSellerLabelDetail(id: number) {
  const language = useGqlLanguage();
  const { data, loading, error, refetch } = useQuery<SellerLabelResult>(SELLER_LABEL, {
    variables: { id, language },
    skip: Number.isNaN(id),
    notifyOnNetworkStatusChange: true,
  });
  return { label: data?.sellerLabel ?? null, loading, error, refetch };
}
