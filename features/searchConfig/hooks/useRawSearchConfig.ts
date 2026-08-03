"use client";

import { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import {
  KIND_CONFIG,
  type RawCatalogPageInfo,
  type SearchKind,
  type SearchRow,
} from "../types";

const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const EXPORT_PAGE_SIZE = 200;

type Connection = { nodes: SearchRow[]; pageInfo: RawCatalogPageInfo };
type Result = Record<string, Connection>;

/** Paginated list state for one search-config table (inactive included). */
export function useRawSearchConfig(kind: SearchKind) {
  const cfg = KIND_CONFIG[kind];
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);
  const client = useApolloClient();

  const setSearch = (value: string) => {
    setPage(1);
    setSearchState(value);
  };
  const setPageSize = (size: number) => {
    setPage(1);
    setPageSizeState(size);
  };

  const { data, loading, error, refetch } = useQuery<Result>(cfg.listQuery, {
    variables: { page, pageSize, search: search || undefined },
    notifyOnNetworkStatusChange: true,
  });

  const connection = data?.[cfg.listField];

  /** Walks every page so exports include rows beyond the visible page. */
  const fetchAll = async (): Promise<SearchRow[]> => {
    const all: SearchRow[] = [];
    for (let current = 1; current < 5000; current += 1) {
      const result = await client.query<Result>({
        query: cfg.listQuery,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const conn = result.data?.[cfg.listField];
      if (!conn) break;
      all.push(...conn.nodes);
      if (!conn.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    rows: connection?.nodes ?? [],
    pageInfo: connection?.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
  };
}

/** Single-row fetch for the edit screen. */
export function useRawSearchRow(kind: SearchKind, id: number) {
  const cfg = KIND_CONFIG[kind];
  const { data, loading, error, refetch } = useQuery<Result>(cfg.listQuery, {
    variables: { id, page: 1, pageSize: 1 },
    skip: !Number.isFinite(id),
    notifyOnNetworkStatusChange: true,
  });
  return {
    row: data?.[cfg.listField]?.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}
