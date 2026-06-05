"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ADMIN } from "@/graphql/admins/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { AdminResult } from "../types";

export function useAdminDetail(id: string) {
  const language = useGqlLanguage();
  const { data, loading, error, refetch } = useQuery<AdminResult>(GET_ADMIN, {
    variables: { id, language },
  });

  return { admin: data?.getAdmin ?? null, loading, error, refetch };
}
