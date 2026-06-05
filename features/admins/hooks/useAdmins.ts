"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { LIST_ADMINS } from "@/graphql/admins/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { AdminRole, AdminType } from "@/types/enums";
import type { AdminsListResult } from "../types";

const PAGE_SIZE = 20;

export type AdminFilters = {
  adminType?: AdminType;
  role?: AdminRole;
  isActive?: boolean;
};

/** Paginated, filterable admin list for PLATFORM admins (MANAGE_ADMINS). */
export function useAdmins() {
  const language = useGqlLanguage();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AdminFilters>({});

  const { data, loading, error, refetch } = useQuery<AdminsListResult>(LIST_ADMINS, {
    variables: { language, page, pageSize: PAGE_SIZE, ...filters },
    notifyOnNetworkStatusChange: true,
  });

  const updateFilters = (next: AdminFilters) => {
    setPage(1);
    setFilters(next);
  };

  return {
    admins: data?.getAdmins.nodes ?? [],
    pageInfo: data?.getAdmins.pageInfo,
    loading,
    error,
    page,
    setPage,
    filters,
    setFilters: updateFilters,
    refetch,
  };
}
