"use client";

import { useEffect, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { GET_RAW_STORE_PRODUCTS } from "@/graphql/storeProducts/queries";
import { GET_RAW_STORE_SUB_CATEGORIES } from "@/graphql/stores/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { RawCatalogPageInfo, RawStoreProduct } from "../types";

const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const EXPORT_PAGE_SIZE = 200;

type Connection<T> = { nodes: T[]; pageInfo: RawCatalogPageInfo };
type ProductsResult = { rawStoreProducts: Connection<RawStoreProduct> };

/** Whole StoreProduct catalog (inactive + soft-deleted included). PLATFORM admins. */
export function useRawStoreProducts(filters: {
  subCategoryId?: number;
  deleted?: boolean;
}) {
  const { subCategoryId, deleted } = filters;
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

  const variables = {
    page,
    pageSize,
    search: search || undefined,
    subCategoryId,
    deleted,
  };

  const { data, loading, error, refetch } = useQuery<ProductsResult>(
    GET_RAW_STORE_PRODUCTS,
    { variables, notifyOnNetworkStatusChange: true },
  );

  /** Walks every page so exports include rows beyond the visible page. */
  const fetchAll = async (): Promise<RawStoreProduct[]> => {
    const all: RawStoreProduct[] = [];
    for (let current = 1; current < 5000; current += 1) {
      const result = await client.query<ProductsResult>({
        query: GET_RAW_STORE_PRODUCTS,
        variables: {
          page: current,
          pageSize: EXPORT_PAGE_SIZE,
          subCategoryId,
          deleted,
        },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawStoreProducts;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    rows: data?.rawStoreProducts.nodes ?? [],
    pageInfo: data?.rawStoreProducts.pageInfo,
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

export function useRawStoreProduct(id: number) {
  const { data, loading, error, refetch } = useQuery<ProductsResult>(
    GET_RAW_STORE_PRODUCTS,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawStoreProducts.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

export type ParentOption = { value: string; label: string };

type SubCategory = {
  id: number;
  translations: { language: string; name: string }[];
};
type SubCategoriesResult = {
  rawStoreSubCategories: {
    nodes: SubCategory[];
    pageInfo: RawCatalogPageInfo;
  };
};

/** Every store sub category as `{ value: id, label: "name (#id)" }`. */
export function useStoreSubCategoryOptions(): {
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
      const all: SubCategory[] = [];
      for (let current = 1; current < 1000; current += 1) {
        const result = await client.query<SubCategoriesResult>({
          query: GET_RAW_STORE_SUB_CATEGORIES,
          variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        });
        const connection = result.data?.rawStoreSubCategories;
        if (!connection) break;
        all.push(...connection.nodes);
        if (!connection.pageInfo.hasNextPage) break;
      }
      if (!cancelled) {
        const nameOf = (sc: SubCategory) =>
          sc.translations.find((t) => t.language === language)?.name ??
          sc.translations.find((t) => t.language === "ES")?.name ??
          sc.translations[0]?.name ??
          "—";
        setOptions(
          all.map((sc) => ({ value: String(sc.id), label: `${nameOf(sc)} (#${sc.id})` })),
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
