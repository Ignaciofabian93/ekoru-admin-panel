"use client";

import { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { GET_RAW_SERVICE_PACKAGES } from "@/graphql/servicePackages/queries";
import type { RawCatalogPageInfo, RawServicePackage } from "../types";

const DEFAULT_PAGE_SIZE = 50;
const EXPORT_PAGE_SIZE = 200;

type Connection = { nodes: RawServicePackage[]; pageInfo: RawCatalogPageInfo };
type Result = { rawServicePackages: Connection };

/** Whole ServicePackage catalog (inactive included), each with its items. */
export function useRawServicePackages() {
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const client = useApolloClient();

  const setSearch = (value: string) => {
    setPage(1);
    setSearchState(value);
  };

  const { data, loading, error, refetch } = useQuery<Result>(GET_RAW_SERVICE_PACKAGES, {
    variables: { page, pageSize, search: search || undefined },
    notifyOnNetworkStatusChange: true,
  });

  const fetchAll = async (): Promise<RawServicePackage[]> => {
    const all: RawServicePackage[] = [];
    for (let current = 1; current < 5000; current += 1) {
      const result = await client.query<Result>({
        query: GET_RAW_SERVICE_PACKAGES,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawServicePackages;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    rows: data?.rawServicePackages.nodes ?? [],
    pageInfo: data?.rawServicePackages.pageInfo,
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

/** Single package (with items) for the edit screen. */
export function useRawServicePackage(id: number) {
  const { data, loading, error, refetch } = useQuery<Result>(GET_RAW_SERVICE_PACKAGES, {
    variables: { id, page: 1, pageSize: 1 },
    skip: !Number.isFinite(id),
    notifyOnNetworkStatusChange: true,
  });
  return {
    row: data?.rawServicePackages.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}
