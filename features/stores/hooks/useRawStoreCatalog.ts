"use client";

import { useEffect, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import {
  GET_RAW_STORE_CATEGORIES,
  GET_RAW_STORE_SUB_CATEGORIES,
} from "@/graphql/stores/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import {
  displayName,
  type RawCatalogPageInfo,
  type RawStoreCategory,
  type RawStoreSubCategory,
} from "../types";

const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
// Bigger page when walking the whole table for an export — fewer round trips.
const EXPORT_PAGE_SIZE = 200;

type Connection<T> = { nodes: T[]; pageInfo: RawCatalogPageInfo };

type StoreCategoriesResult = { rawStoreCategories: Connection<RawStoreCategory> };
type StoreSubCategoriesResult = {
  rawStoreSubCategories: Connection<RawStoreSubCategory>;
};

/** Shared page/search state for the raw catalog list hooks. */
function useListState() {
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  const setSearch = (value: string) => {
    setPage(1);
    setSearchState(value);
  };
  const setPageSize = (size: number) => {
    setPage(1);
    setPageSizeState(size);
  };

  return { search, setSearch, page, setPage, pageSize, setPageSize };
}

/** Raw store categories (all translations, inactive included). PLATFORM admins. */
export function useRawStoreCategories() {
  const state = useListState();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<StoreCategoriesResult>(
    GET_RAW_STORE_CATEGORIES,
    {
      variables: {
        page: state.page,
        pageSize: state.pageSize,
        search: state.search || undefined,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  /** Walks every page so exports include rows beyond the visible page. */
  const fetchAll = async (): Promise<RawStoreCategory[]> => {
    const all: RawStoreCategory[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<StoreCategoriesResult>({
        query: GET_RAW_STORE_CATEGORIES,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawStoreCategories;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.rawStoreCategories.nodes ?? [],
    pageInfo: data?.rawStoreCategories.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

/** Raw store sub categories, optionally scoped to one store category. */
export function useRawStoreSubCategories(storeCategoryId?: number) {
  const state = useListState();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<StoreSubCategoriesResult>(
    GET_RAW_STORE_SUB_CATEGORIES,
    {
      variables: {
        page: state.page,
        pageSize: state.pageSize,
        search: state.search || undefined,
        storeCategoryId,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const fetchAll = async (): Promise<RawStoreSubCategory[]> => {
    const all: RawStoreSubCategory[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<StoreSubCategoriesResult>({
        query: GET_RAW_STORE_SUB_CATEGORIES,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE, storeCategoryId },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawStoreSubCategories;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.rawStoreSubCategories.nodes ?? [],
    pageInfo: data?.rawStoreSubCategories.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

// ─── Single-row hooks for the edit screens ────────────────────────────────────

export function useRawStoreCategory(id: number) {
  const { data, loading, error, refetch } = useQuery<StoreCategoriesResult>(
    GET_RAW_STORE_CATEGORIES,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawStoreCategories.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

export function useRawStoreSubCategory(id: number) {
  const { data, loading, error, refetch } = useQuery<StoreSubCategoriesResult>(
    GET_RAW_STORE_SUB_CATEGORIES,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawStoreSubCategories.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

// ─── Parent selector ──────────────────────────────────────────────────────────

export type ParentOption = { value: string; label: string };

/**
 * Every store category as `{ value: id, label: "name (#id)" }` for the parent
 * selector of the sub category form and the list filter.
 */
export function useStoreCategoryOptions(): {
  options: ParentOption[];
  loading: boolean;
} {
  const client = useApolloClient();
  const language = useGqlLanguage();
  const [options, setOptions] = useState<ParentOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all: RawStoreCategory[] = [];
      for (let current = 1; current < 1000; current += 1) {
        const result = await client.query<StoreCategoriesResult>({
          query: GET_RAW_STORE_CATEGORIES,
          variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        });
        const connection = result.data?.rawStoreCategories;
        if (!connection) break;
        all.push(...connection.nodes);
        if (!connection.pageInfo.hasNextPage) break;
      }
      if (!cancelled) {
        setOptions(
          all.map((c) => ({
            value: String(c.id),
            label: `${displayName(c, language)} (#${c.id})`,
          })),
        );
        setLoading(false);
      }
    })().catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [client, language]);

  return { options, loading };
}
