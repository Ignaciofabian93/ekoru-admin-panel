"use client";

import { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { GET_ADMIN_PAYMENT_CONFIGS } from "@/graphql/paymentConfigs/queries";
import type { RawCatalogPageInfo, RawPaymentConfig } from "../types";

const DEFAULT_PAGE_SIZE = 50;
const EXPORT_PAGE_SIZE = 200;

type Connection = { nodes: RawPaymentConfig[]; pageInfo: RawCatalogPageInfo };
type Result = { adminChileanPaymentConfigs: Connection };

/** All payment provider configs (one row per seller+provider). PLATFORM admins. */
export function useRawPaymentConfigs() {
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const client = useApolloClient();

  const setSearch = (value: string) => {
    setPage(1);
    setSearchState(value);
  };

  const { data, loading, error, refetch } = useQuery<Result>(GET_ADMIN_PAYMENT_CONFIGS, {
    variables: { page, pageSize, search: search || undefined },
    notifyOnNetworkStatusChange: true,
  });

  const fetchAll = async (): Promise<RawPaymentConfig[]> => {
    const all: RawPaymentConfig[] = [];
    for (let current = 1; current < 5000; current += 1) {
      const result = await client.query<Result>({
        query: GET_ADMIN_PAYMENT_CONFIGS,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.adminChileanPaymentConfigs;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    rows: data?.adminChileanPaymentConfigs.nodes ?? [],
    pageInfo: data?.adminChileanPaymentConfigs.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
    search,
    setSearch,
    page,
    setPage,
  };
}

/** Single config for the edit screen (`id` is the raw route param). */
export function useRawPaymentConfig(id?: string) {
  const numericId = id != null ? Number(id) : undefined;
  const { data, loading, error, refetch } = useQuery<Result>(GET_ADMIN_PAYMENT_CONFIGS, {
    variables: { id: numericId, page: 1, pageSize: 1 },
    skip: numericId == null || !Number.isFinite(numericId),
    notifyOnNetworkStatusChange: true,
  });
  return {
    row: data?.adminChileanPaymentConfigs.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}
