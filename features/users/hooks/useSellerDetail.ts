"use client";

import { useQuery } from "@apollo/client/react";
import { GET_SELLER } from "@/graphql/sellers/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { SellerResult } from "../types";

export function useSellerDetail(id: string) {
  const language = useGqlLanguage();
  const { data, loading, error, refetch } = useQuery<SellerResult>(GET_SELLER, {
    variables: { id, language },
  });

  return {
    seller: data?.getSeller ?? null,
    loading,
    error,
    refetch,
  };
}
