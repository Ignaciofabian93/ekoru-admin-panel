"use client";

import { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { GET_RAW_SERVICE_CREDENTIALS } from "@/graphql/providerCredentials/queries";
import type { RawCatalogPageInfo, RawProviderCredentials } from "../types";

const DEFAULT_PAGE_SIZE = 50;
const EXPORT_PAGE_SIZE = 200;

type Connection = { nodes: RawProviderCredentials[]; pageInfo: RawCatalogPageInfo };
type Result = { rawServiceCredentials: Connection };

/** All provider credentials (one row per seller). PLATFORM admins. */
export function useRawProviderCredentials() {
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const client = useApolloClient();

  const setSearch = (value: string) => {
    setPage(1);
    setSearchState(value);
  };

  const { data, loading, error, refetch } = useQuery<Result>(
    GET_RAW_SERVICE_CREDENTIALS,
    {
      variables: { page, pageSize, search: search || undefined },
      notifyOnNetworkStatusChange: true,
    },
  );

  const fetchAll = async (): Promise<RawProviderCredentials[]> => {
    const all: RawProviderCredentials[] = [];
    for (let current = 1; current < 5000; current += 1) {
      const result = await client.query<Result>({
        query: GET_RAW_SERVICE_CREDENTIALS,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawServiceCredentials;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    rows: data?.rawServiceCredentials.nodes ?? [],
    pageInfo: data?.rawServiceCredentials.pageInfo,
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

/** Single credentials row for the edit screen. */
export function useRawProviderCredential(id: number) {
  const { data, loading, error, refetch } = useQuery<Result>(
    GET_RAW_SERVICE_CREDENTIALS,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawServiceCredentials.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}
