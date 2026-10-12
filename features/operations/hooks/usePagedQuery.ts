"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import type { DocumentNode } from "graphql";
import type { Connection } from "../types";

const PAGE_SIZE = 20;

/** Drops empty filter values: an empty enum or "" would be sent and rejected. */
const clean = (filters: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

/**
 * One operator list: a paginated root field queried with the screen's
 * filters. Changing a filter goes back to page 1 (`setFilter`).
 */
export function usePagedQuery<T, F extends Record<string, unknown>>(
  document: DocumentNode,
  field: string,
  initialFilters: F,
) {
  const [filters, setFilters] = useState<F>(initialFilters);
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useQuery<Record<string, Connection<T>>>(
    document,
    {
      variables: { ...clean(filters), page, pageSize: PAGE_SIZE },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    },
  );

  const setFilter = <K extends keyof F>(key: K, value: F[K]) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return {
    rows: data?.[field]?.nodes ?? [],
    pageInfo: data?.[field]?.pageInfo ?? null,
    loading,
    error,
    filters,
    setFilter,
    page,
    setPage,
    refetch,
  };
}
