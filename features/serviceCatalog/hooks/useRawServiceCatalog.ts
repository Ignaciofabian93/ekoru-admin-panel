"use client";

import { useEffect, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import {
  GET_RAW_SERVICE_CATEGORIES,
  GET_RAW_SERVICE_SUB_CATEGORIES,
} from "@/graphql/serviceCatalog/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import {
  displayName,
  type RawCatalogPageInfo,
  type RawServiceCategory,
  type RawServiceSubCategory,
} from "../types";

const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const EXPORT_PAGE_SIZE = 200;

type Connection<T> = { nodes: T[]; pageInfo: RawCatalogPageInfo };

type CategoriesResult = {
  rawServiceCategories: Connection<RawServiceCategory>;
};
type SubCategoriesResult = {
  rawServiceSubCategories: Connection<RawServiceSubCategory>;
};

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

// ─── Service categories ────────────────────────────────────────────────────────

export function useRawServiceCategories() {
  const state = useListState();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<CategoriesResult>(
    GET_RAW_SERVICE_CATEGORIES,
    {
      variables: {
        page: state.page,
        pageSize: state.pageSize,
        search: state.search || undefined,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const fetchAll = async (): Promise<RawServiceCategory[]> => {
    const all: RawServiceCategory[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<CategoriesResult>({
        query: GET_RAW_SERVICE_CATEGORIES,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawServiceCategories;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.rawServiceCategories.nodes ?? [],
    pageInfo: data?.rawServiceCategories.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

export function useRawServiceCategory(id: number) {
  const { data, loading, error, refetch } = useQuery<CategoriesResult>(
    GET_RAW_SERVICE_CATEGORIES,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawServiceCategories.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

// ─── Service sub categories ─────────────────────────────────────────────────────

export function useRawServiceSubCategories(serviceCategoryId?: number) {
  const state = useListState();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<SubCategoriesResult>(
    GET_RAW_SERVICE_SUB_CATEGORIES,
    {
      variables: {
        page: state.page,
        pageSize: state.pageSize,
        search: state.search || undefined,
        serviceCategoryId,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const fetchAll = async (): Promise<RawServiceSubCategory[]> => {
    const all: RawServiceSubCategory[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<SubCategoriesResult>({
        query: GET_RAW_SERVICE_SUB_CATEGORIES,
        variables: {
          page: current,
          pageSize: EXPORT_PAGE_SIZE,
          serviceCategoryId,
        },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawServiceSubCategories;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.rawServiceSubCategories.nodes ?? [],
    pageInfo: data?.rawServiceSubCategories.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

export function useRawServiceSubCategory(id: number) {
  const { data, loading, error, refetch } = useQuery<SubCategoriesResult>(
    GET_RAW_SERVICE_SUB_CATEGORIES,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawServiceSubCategories.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

// ─── Parent selector (service category → sub category) ─────────────────────────

export type ParentOption = { value: string; label: string };

export function useServiceCategoryOptions(): {
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
      const all: RawServiceCategory[] = [];
      for (let current = 1; current < 1000; current += 1) {
        const result = await client.query<CategoriesResult>({
          query: GET_RAW_SERVICE_CATEGORIES,
          variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        });
        const connection = result.data?.rawServiceCategories;
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
