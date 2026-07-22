"use client";

import { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import {
  GET_RAW_CO2_IMPACTS,
  GET_RAW_MATERIAL_IMPACTS,
  GET_RAW_WATER_IMPACTS,
} from "@/graphql/impact/queries";
import type {
  ImpactMessageKind,
  RawCatalogPageInfo,
  RawImpactMessage,
  RawMaterialImpact,
} from "../types";

const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const EXPORT_PAGE_SIZE = 200;

type Connection<T> = { nodes: T[]; pageInfo: RawCatalogPageInfo };

const MESSAGE_QUERY = {
  water: GET_RAW_WATER_IMPACTS,
  co2: GET_RAW_CO2_IMPACTS,
} as const;
const MESSAGE_KEY = {
  water: "rawWaterImpactMessages",
  co2: "rawCo2ImpactMessages",
} as const;

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

// ─── Material impact estimates ────────────────────────────────────────────────

type MaterialResult = {
  rawMaterialImpactEstimates: Connection<RawMaterialImpact>;
};

export function useRawMaterialImpacts() {
  const state = useListState();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery<MaterialResult>(
    GET_RAW_MATERIAL_IMPACTS,
    {
      variables: {
        page: state.page,
        pageSize: state.pageSize,
        search: state.search || undefined,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const fetchAll = async (): Promise<RawMaterialImpact[]> => {
    const all: RawMaterialImpact[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<MaterialResult>({
        query: GET_RAW_MATERIAL_IMPACTS,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.rawMaterialImpactEstimates;
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.rawMaterialImpactEstimates.nodes ?? [],
    pageInfo: data?.rawMaterialImpactEstimates.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

export function useRawMaterialImpact(id: number) {
  const { data, loading, error, refetch } = useQuery<MaterialResult>(
    GET_RAW_MATERIAL_IMPACTS,
    {
      variables: { id, page: 1, pageSize: 1 },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    row: data?.rawMaterialImpactEstimates.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}

// ─── Impact messages (water / co2) ─────────────────────────────────────────────

type MessageResult = Record<string, Connection<RawImpactMessage>>;

export function useRawMessages(kind: ImpactMessageKind) {
  const state = useListState();
  const client = useApolloClient();
  const query = MESSAGE_QUERY[kind];
  const key = MESSAGE_KEY[kind];

  const { data, loading, error, refetch } = useQuery<MessageResult>(query, {
    variables: {
      page: state.page,
      pageSize: state.pageSize,
      search: state.search || undefined,
    },
    notifyOnNetworkStatusChange: true,
  });

  const fetchAll = async (): Promise<RawImpactMessage[]> => {
    const all: RawImpactMessage[] = [];
    for (let current = 1; current < 1000; current += 1) {
      const result = await client.query<MessageResult>({
        query,
        variables: { page: current, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const connection = result.data?.[key];
      if (!connection) break;
      all.push(...connection.nodes);
      if (!connection.pageInfo.hasNextPage) break;
    }
    return all;
  };

  return {
    ...state,
    rows: data?.[key]?.nodes ?? [],
    pageInfo: data?.[key]?.pageInfo,
    loading,
    error,
    refetch,
    fetchAll,
  };
}

export function useRawMessage(kind: ImpactMessageKind, id: number) {
  const query = MESSAGE_QUERY[kind];
  const key = MESSAGE_KEY[kind];
  const { data, loading, error, refetch } = useQuery<MessageResult>(query, {
    variables: { id, page: 1, pageSize: 1 },
    skip: !Number.isFinite(id),
    notifyOnNetworkStatusChange: true,
  });
  return {
    row: data?.[key]?.nodes[0] ?? null,
    loading,
    error,
    refetch,
  };
}
