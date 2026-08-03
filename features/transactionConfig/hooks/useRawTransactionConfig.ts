"use client";

import { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { KIND_CONFIG, type TxConfigKind, type TxRow } from "../types";

type Result = Record<string, TxRow[]>;

/**
 * List state for one transaction-config table. These tables hold only a handful
 * of rows, so the whole set is fetched once and filtered client-side over the
 * primary (key) column.
 */
export function useRawTransactionConfig(kind: TxConfigKind) {
  const cfg = KIND_CONFIG[kind];
  const [search, setSearch] = useState("");
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<Result>(cfg.listQuery, {
    notifyOnNetworkStatusChange: true,
  });

  const all = data?.[cfg.listField] ?? [];
  const needle = search.trim().toLowerCase();
  const rows = needle
    ? all.filter((r) =>
        String(r[cfg.primaryField] ?? "")
          .toLowerCase()
          .includes(needle),
      )
    : all;

  /** Fresh full set for exports (bypasses the cache). */
  const fetchAll = async (): Promise<TxRow[]> => {
    const result = await client.query<Result>({
      query: cfg.listQuery,
      fetchPolicy: "network-only",
    });
    return result.data?.[cfg.listField] ?? [];
  };

  return { rows, loading, error, refetch, fetchAll, search, setSearch };
}

/** Single-row fetch for the edit screen. `id` is the raw route param. */
export function useRawTransactionConfigRow(kind: TxConfigKind, id?: string) {
  const cfg = KIND_CONFIG[kind];
  const { data, loading, error, refetch } = useQuery<Record<string, TxRow | null>>(
    cfg.itemQuery,
    {
      variables: id != null ? { id: cfg.coerceId(id) } : undefined,
      skip: id == null,
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.[cfg.itemField] ?? null,
    loading,
    error,
    refetch,
  };
}
