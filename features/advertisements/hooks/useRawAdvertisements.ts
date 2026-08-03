"use client";

import { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { GET_RAW_ADVERTISEMENTS } from "@/graphql/advertisements/queries";
import type { RawAdvertisement, RawCatalogPageInfo } from "../types";

const DEFAULT_PAGE_SIZE = 50;
const EXPORT_PAGE_SIZE = 200;

type Connection = { nodes: RawAdvertisement[]; pageInfo: RawCatalogPageInfo };
type Result = { rawAdvertisements: Connection };

/** Whole Advertisement table (inactive included). PLATFORM admins. */
export function useRawAdvertisements() {
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const client = useApolloClient();

  const setSearch = (value: string) => {
    setPage(1);
    setSearchState(value);
  };

  const { data, loading, error, refetch } = useQuery<Result>(GET_RAW_ADVERTISEMENTS, {
    variables: { page, pageSize, search: search || undefined },
    notifyOnNetworkStatusChange: true,
  });

  const fetchAll = async (): Promise<RawAdvertisement[]> => {
    const all: RawAdvertisement[] = [];
    for (let current = 1; current < 5000; current += 1) {
      const result = await client.query<Result>({
        query: GET_RAW_ADVERTISEMENTS,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawAdvertisements;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    rows: data?.rawAdvertisements.nodes ?? [],
    pageInfo: data?.rawAdvertisements.pageInfo,
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

/** Single ad for the edit screen. */
export function useRawAdvertisement(id: number) {
  const { data, loading, error, refetch } = useQuery<Result>(GET_RAW_ADVERTISEMENTS, {
    variables: { id, page: 1, pageSize: 1 },
    skip: !Number.isFinite(id),
    notifyOnNetworkStatusChange: true,
  });
  return {
    row: data?.rawAdvertisements.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}
