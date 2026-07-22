"use client";

import { useEffect, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { GET_RAW_PRODUCTS } from "@/graphql/products/queries";
import { GET_RAW_PRODUCT_CATEGORIES } from "@/graphql/marketplace/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { RawCatalogPageInfo, RawProduct } from "../types";

const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const EXPORT_PAGE_SIZE = 200;

type Connection<T> = { nodes: T[]; pageInfo: RawCatalogPageInfo };
type ProductsResult = { rawProducts: Connection<RawProduct> };

/** Whole Product catalog (inactive + soft-deleted included). PLATFORM admins. */
export function useRawProducts(filters: {
  productCategoryId?: number;
  deleted?: boolean;
}) {
  const { productCategoryId, deleted } = filters;
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

  const { data, loading, error, refetch } = useQuery<ProductsResult>(GET_RAW_PRODUCTS, {
    variables: {
      page,
      pageSize,
      search: search || undefined,
      productCategoryId,
      deleted,
    },
    notifyOnNetworkStatusChange: true,
  });

  const fetchAll = async (): Promise<RawProduct[]> => {
    const all: RawProduct[] = [];
    for (let current = 1; current < 5000; current += 1) {
      const result = await client.query<ProductsResult>({
        query: GET_RAW_PRODUCTS,
        variables: {
          page: current,
          pageSize: EXPORT_PAGE_SIZE,
          productCategoryId,
          deleted,
        },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawProducts;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    rows: data?.rawProducts.nodes ?? [],
    pageInfo: data?.rawProducts.pageInfo,
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

export function useRawProduct(id: number) {
  const { data, loading, error, refetch } = useQuery<ProductsResult>(GET_RAW_PRODUCTS, {
    variables: { id, page: 1, pageSize: 1 },
    skip: !Number.isFinite(id),
    notifyOnNetworkStatusChange: true,
  });
  return {
    row: data?.rawProducts.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

export type ParentOption = { value: string; label: string };

type Category = {
  id: number;
  translations: { language: string; name: string }[];
};
type CategoriesResult = {
  rawProductCategories: { nodes: Category[]; pageInfo: RawCatalogPageInfo };
};

/** Every product category as `{ value: id, label: "name (#id)" }`. */
export function useProductCategoryOptions(): {
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
      const all: Category[] = [];
      for (let current = 1; current < 1000; current += 1) {
        const result = await client.query<CategoriesResult>({
          query: GET_RAW_PRODUCT_CATEGORIES,
          variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        });
        const connection = result.data?.rawProductCategories;
        if (!connection) break;
        all.push(...connection.nodes);
        if (!connection.pageInfo.hasNextPage) break;
      }
      if (!cancelled) {
        const nameOf = (c: Category) =>
          c.translations.find((t) => t.language === language)?.name ??
          c.translations.find((t) => t.language === "ES")?.name ??
          c.translations[0]?.name ??
          "—";
        setOptions(
          all.map((c) => ({ value: String(c.id), label: `${nameOf(c)} (#${c.id})` })),
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
