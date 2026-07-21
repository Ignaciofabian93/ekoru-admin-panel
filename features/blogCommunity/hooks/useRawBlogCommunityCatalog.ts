"use client";

import { useEffect, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import {
  GET_RAW_BLOG_CATEGORIES,
  GET_RAW_COMMUNITY_CATEGORIES,
  GET_RAW_COMMUNITY_SUB_CATEGORIES,
} from "@/graphql/blogCommunity/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import {
  displayName,
  type RawBlogCategory,
  type RawCatalogPageInfo,
  type RawCommunityCategory,
  type RawCommunitySubCategory,
} from "../types";

const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
// Bigger page when walking the whole table for an export — fewer round trips.
const EXPORT_PAGE_SIZE = 200;

type Connection<T> = { nodes: T[]; pageInfo: RawCatalogPageInfo };

type BlogCategoriesResult = { rawBlogCategories: Connection<RawBlogCategory> };
type CommunityCategoriesResult = {
  rawCommunityCategories: Connection<RawCommunityCategory>;
};
type CommunitySubCategoriesResult = {
  rawCommunitySubCategories: Connection<RawCommunitySubCategory>;
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

// ─── Blog categories ──────────────────────────────────────────────────────────

/** Raw blog categories (all translations, inactive included). PLATFORM admins. */
export function useRawBlogCategories() {
  const state = useListState();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<BlogCategoriesResult>(
    GET_RAW_BLOG_CATEGORIES,
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
  const fetchAll = async (): Promise<RawBlogCategory[]> => {
    const all: RawBlogCategory[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<BlogCategoriesResult>({
        query: GET_RAW_BLOG_CATEGORIES,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawBlogCategories;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.rawBlogCategories.nodes ?? [],
    pageInfo: data?.rawBlogCategories.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

export function useRawBlogCategory(id: number) {
  const { data, loading, error, refetch } = useQuery<BlogCategoriesResult>(
    GET_RAW_BLOG_CATEGORIES,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawBlogCategories.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

// ─── Community categories ─────────────────────────────────────────────────────

export function useRawCommunityCategories() {
  const state = useListState();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<CommunityCategoriesResult>(
    GET_RAW_COMMUNITY_CATEGORIES,
    {
      variables: {
        page: state.page,
        pageSize: state.pageSize,
        search: state.search || undefined,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const fetchAll = async (): Promise<RawCommunityCategory[]> => {
    const all: RawCommunityCategory[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<CommunityCategoriesResult>({
        query: GET_RAW_COMMUNITY_CATEGORIES,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawCommunityCategories;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.rawCommunityCategories.nodes ?? [],
    pageInfo: data?.rawCommunityCategories.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

export function useRawCommunityCategory(id: number) {
  const { data, loading, error, refetch } = useQuery<CommunityCategoriesResult>(
    GET_RAW_COMMUNITY_CATEGORIES,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawCommunityCategories.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

// ─── Community sub categories ─────────────────────────────────────────────────

export function useRawCommunitySubCategories(communityCategoryId?: number) {
  const state = useListState();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<CommunitySubCategoriesResult>(
    GET_RAW_COMMUNITY_SUB_CATEGORIES,
    {
      variables: {
        page: state.page,
        pageSize: state.pageSize,
        search: state.search || undefined,
        communityCategoryId,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const fetchAll = async (): Promise<RawCommunitySubCategory[]> => {
    const all: RawCommunitySubCategory[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<CommunitySubCategoriesResult>({
        query: GET_RAW_COMMUNITY_SUB_CATEGORIES,
        variables: {
          page: current,
          pageSize: EXPORT_PAGE_SIZE,
          communityCategoryId,
        },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawCommunitySubCategories;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.rawCommunitySubCategories.nodes ?? [],
    pageInfo: data?.rawCommunitySubCategories.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

export function useRawCommunitySubCategory(id: number) {
  const { data, loading, error, refetch } = useQuery<CommunitySubCategoriesResult>(
    GET_RAW_COMMUNITY_SUB_CATEGORIES,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawCommunitySubCategories.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

// ─── Parent selector (community category → sub category) ───────────────────────

export type ParentOption = { value: string; label: string };

/**
 * Every community category as `{ value: id, label: "name (#id)" }` for the
 * parent selector of the sub category form and the list filter.
 */
export function useCommunityCategoryOptions(): {
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
      const all: RawCommunityCategory[] = [];
      for (let current = 1; current < 1000; current += 1) {
        const result = await client.query<CommunityCategoriesResult>({
          query: GET_RAW_COMMUNITY_CATEGORIES,
          variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        });
        const connection = result.data?.rawCommunityCategories;
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
