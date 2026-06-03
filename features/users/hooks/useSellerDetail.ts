"use client";

import { useQuery } from "@apollo/client/react";
import { GET_SELLER } from "@/graphql/sellers/queries";
import type { SellerResult } from "../types";

export function useSellerDetail(id: string) {
  const { data, loading, error, refetch } = useQuery<SellerResult>(GET_SELLER, {
    variables: { id },
  });

  return {
    seller: data?.adminSeller ?? null,
    loading,
    error,
    refetch,
  };
}
