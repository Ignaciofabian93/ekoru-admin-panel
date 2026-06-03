"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { LIST_SELLERS } from "@/graphql/sellers/queries";
import type { SellerListResult } from "../types";

const PAGE_SIZE = 50;

/**
 * Lists sellers for PLATFORM admins. `search` is part of the query variables, so
 * Apollo refetches automatically whenever it changes.
 */
export function useSellers() {
  const [search, setSearch] = useState("");

  const { data, loading, error, refetch } = useQuery<SellerListResult>(LIST_SELLERS, {
    variables: { search, limit: PAGE_SIZE, offset: 0 },
    notifyOnNetworkStatusChange: true,
  });

  return {
    sellers: data?.adminSellers.items ?? [],
    total: data?.adminSellers.total ?? 0,
    loading,
    error,
    search,
    setSearch,
    refetch,
  };
}
