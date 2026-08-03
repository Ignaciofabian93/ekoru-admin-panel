"use client";

import { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { GET_RAW_SERVICES } from "@/graphql/services/queries";
import type { RawCatalogPageInfo, RawService } from "../types";

const DEFAULT_PAGE_SIZE = 50;
const EXPORT_PAGE_SIZE = 200;

type Connection = { nodes: RawService[]; pageInfo: RawCatalogPageInfo };
type ServicesResult = { rawServices: Connection };

/** Whole Service catalog (inactive included), each with media + FAQ. PLATFORM admins. */
export function useRawServices() {
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const client = useApolloClient();

  const setSearch = (value: string) => {
    setPage(1);
    setSearchState(value);
  };

  const { data, loading, error, refetch } = useQuery<ServicesResult>(GET_RAW_SERVICES, {
    variables: { page, pageSize, search: search || undefined },
    notifyOnNetworkStatusChange: true,
  });

  /** Walks every page so exports include rows beyond the visible page. */
  const fetchAll = async (): Promise<RawService[]> => {
    const all: RawService[] = [];
    for (let current = 1; current < 5000; current += 1) {
      const result = await client.query<ServicesResult>({
        query: GET_RAW_SERVICES,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawServices;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    rows: data?.rawServices.nodes ?? [],
    pageInfo: data?.rawServices.pageInfo,
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

/** Single service (with media + FAQ) for the edit screen. */
export function useRawService(id: number) {
  const { data, loading, error, refetch } = useQuery<ServicesResult>(GET_RAW_SERVICES, {
    variables: { id, page: 1, pageSize: 1 },
    skip: !Number.isFinite(id),
    notifyOnNetworkStatusChange: true,
  });
  return {
    row: data?.rawServices.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}
