"use client";

import { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { GET_SELLERS } from "@/graphql/sellers/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { SellerType } from "@/types/enums";
import type { Seller } from "@/types/user";

const DEFAULT_PAGE_SIZE = 50;
// Row-per-page choices offered in the list UI.
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
// Bigger page when walking the whole table for an export — fewer round trips.
const EXPORT_PAGE_SIZE = 200;

type PageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
  pageSize: number;
};

type PaginatedSellers = {
  getSellers: {
    nodes: Array<Seller>;
    pageInfo: PageInfo;
  };
};

export type SellerFilters = {
  sellerType?: SellerType;
  isActive?: boolean;
  isVerified?: boolean;
};

/** Paginated, filterable seller list for PLATFORM admins (MANAGE_USERS). */
export function useSellers() {
  const language = useGqlLanguage();
  const client = useApolloClient();

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(DEFAULT_PAGE_SIZE);
  const [filters, setFiltersState] = useState<SellerFilters>({});

  const { data, loading, error, refetch } = useQuery<PaginatedSellers>(GET_SELLERS, {
    variables: {
      language,
      page,
      pageSize,
      searchQuery: search,
      sellerType: filters.sellerType,
      isActive: filters.isActive,
      isVerified: filters.isVerified,
    },
    notifyOnNetworkStatusChange: true,
  });

  // Any filter/search change resets to the first page so the result set and the
  // visible page stay coherent.
  const setFilters = (next: SellerFilters) => {
    setPage(1);
    setFiltersState(next);
  };
  const updateSearch = (value: string) => {
    setPage(1);
    setSearch(value);
  };
  // Changing page size resets to the first page so the offset stays valid.
  const setPageSize = (size: number) => {
    setPage(1);
    setPageSizeState(size);
  };

  /**
   * Imperatively walk every page so an export can include rows beyond the one
   * visible page. Defaults to no filters (full backup); pass filters to scope it.
   */
  const fetchAll = async (exportFilters: SellerFilters = {}): Promise<Seller[]> => {
    const all: Seller[] = [];
    let current = 1;
    // Defensive cap so a malformed pageInfo can never spin forever.
    for (let guard = 0; guard < 1000; guard += 1) {
      const result = await client.query<PaginatedSellers>({
        query: GET_SELLERS,
        variables: {
          language,
          page: current,
          pageSize: EXPORT_PAGE_SIZE,
          searchQuery: "",
          sellerType: exportFilters.sellerType,
          isActive: exportFilters.isActive,
          isVerified: exportFilters.isVerified,
        },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.getSellers;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
      current += 1;
    }
    return all;
  };

  return {
    sellers: data?.getSellers.nodes ?? [],
    pageInfo: data?.getSellers.pageInfo,
    total: data?.getSellers.pageInfo.totalCount ?? 0,
    loading,
    error,
    refetch,
    search,
    setSearch: updateSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    fetchAll,
  };
}
