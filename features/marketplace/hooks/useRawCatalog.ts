"use client";

import { useEffect, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import {
  GET_RAW_DEPARTMENTS,
  GET_RAW_DEPARTMENT_CATEGORIES,
  GET_RAW_PRODUCT_CATEGORIES,
} from "@/graphql/marketplace/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import {
  displayName,
  type RawCatalogPageInfo,
  type RawDepartment,
  type RawDepartmentCategory,
  type RawProductCategory,
} from "../types";

const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
// Bigger page when walking the whole table for an export — fewer round trips.
const EXPORT_PAGE_SIZE = 200;

type Connection<T> = { nodes: T[]; pageInfo: RawCatalogPageInfo };

type DepartmentsResult = { rawDepartments: Connection<RawDepartment> };
type DepartmentCategoriesResult = {
  rawDepartmentCategories: Connection<RawDepartmentCategory>;
};
type ProductCategoriesResult = {
  rawProductCategories: Connection<RawProductCategory>;
};

/** Shared page/search state for the three raw catalog list hooks. */
function useListState() {
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  // Search / page-size changes reset to page 1 so the offset stays coherent.
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

/** Raw departments (all translations, inactive included). PLATFORM admins. */
export function useRawDepartments() {
  const state = useListState();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<DepartmentsResult>(
    GET_RAW_DEPARTMENTS,
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
  const fetchAll = async (): Promise<RawDepartment[]> => {
    const all: RawDepartment[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<DepartmentsResult>({
        query: GET_RAW_DEPARTMENTS,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawDepartments;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.rawDepartments.nodes ?? [],
    pageInfo: data?.rawDepartments.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

/** Raw department categories, optionally scoped to one department. */
export function useRawDepartmentCategories(departmentId?: number) {
  const state = useListState();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<DepartmentCategoriesResult>(
    GET_RAW_DEPARTMENT_CATEGORIES,
    {
      variables: {
        page: state.page,
        pageSize: state.pageSize,
        search: state.search || undefined,
        departmentId,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const fetchAll = async (): Promise<RawDepartmentCategory[]> => {
    const all: RawDepartmentCategory[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<DepartmentCategoriesResult>({
        query: GET_RAW_DEPARTMENT_CATEGORIES,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE, departmentId },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawDepartmentCategories;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.rawDepartmentCategories.nodes ?? [],
    pageInfo: data?.rawDepartmentCategories.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

/** Raw product categories, optionally scoped to one department category. */
export function useRawProductCategories(departmentCategoryId?: number) {
  const state = useListState();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<ProductCategoriesResult>(
    GET_RAW_PRODUCT_CATEGORIES,
    {
      variables: {
        page: state.page,
        pageSize: state.pageSize,
        search: state.search || undefined,
        departmentCategoryId,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const fetchAll = async (): Promise<RawProductCategory[]> => {
    const all: RawProductCategory[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<ProductCategoriesResult>({
        query: GET_RAW_PRODUCT_CATEGORIES,
        variables: {
          page: current,
          pageSize: EXPORT_PAGE_SIZE,
          departmentCategoryId,
        },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawProductCategories;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.rawProductCategories.nodes ?? [],
    pageInfo: data?.rawProductCategories.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

// ─── Single-row hooks for the edit screens ────────────────────────────────────

export function useRawDepartment(id: number) {
  const { data, loading, error, refetch } = useQuery<DepartmentsResult>(
    GET_RAW_DEPARTMENTS,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawDepartments.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

export function useRawDepartmentCategory(id: number) {
  const { data, loading, error, refetch } = useQuery<DepartmentCategoriesResult>(
    GET_RAW_DEPARTMENT_CATEGORIES,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawDepartmentCategories.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

export function useRawProductCategory(id: number) {
  const { data, loading, error, refetch } = useQuery<ProductCategoriesResult>(
    GET_RAW_PRODUCT_CATEGORIES,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawProductCategories.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

// ─── Parent selectors ─────────────────────────────────────────────────────────

export type ParentOption = { value: string; label: string };

/**
 * Every department as `{ value: id, label: "name (#id)" }` for the parent
 * selector of the department-category form and the list filter.
 */
export function useDepartmentOptions(): {
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
      const all: RawDepartment[] = [];
      for (let current = 1; current < 1000; current += 1) {
        const result = await client.query<DepartmentsResult>({
          query: GET_RAW_DEPARTMENTS,
          variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        });
        const connection = result.data?.rawDepartments;
        if (!connection) break;
        all.push(...connection.nodes);
        if (!connection.pageInfo.hasNextPage) break;
      }
      if (!cancelled) {
        setOptions(
          all.map((d) => ({
            value: String(d.id),
            label: `${displayName(d, language)} (#${d.id})`,
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

/**
 * Every department category as select options for the parent selector of the
 * product-category form — the tool for fixing wrongly related rows.
 */
export function useDepartmentCategoryOptions(): {
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
      const all: RawDepartmentCategory[] = [];
      for (let current = 1; current < 1000; current += 1) {
        const result = await client.query<DepartmentCategoriesResult>({
          query: GET_RAW_DEPARTMENT_CATEGORIES,
          variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        });
        const connection = result.data?.rawDepartmentCategories;
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
