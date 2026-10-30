"use client";

import { useQuery } from "@apollo/client/react";
import type { AnalyticsRange } from "@/components/Charts";
import type { SupportedLanguage } from "@/constants/settings";
import {
  BUSINESS_ANALYTICS,
  BUSINESS_ITEM_PERFORMANCE,
  BUSINESS_SALES,
  BUSINESS_SEARCH_INSIGHTS,
  PLATFORM_ANALYTICS,
} from "@/graphql/analytics/queries";
import type {
  BusinessAnalytics,
  ItemPerformance,
  PlatformAnalytics,
  Sale,
  SalesPageInfo,
  SearchInsights,
} from "../types";

// Each hook keeps the last figures on screen while a new period loads
// (`previousData`), so the charts dim instead of flashing empty.

export function usePlatformAnalytics(range: AnalyticsRange, lang: SupportedLanguage) {
  const { data, previousData, loading, error } = useQuery<{
    platformAnalytics: PlatformAnalytics;
  }>(PLATFORM_ANALYTICS, {
    variables: { range, language: lang.toUpperCase() },
    fetchPolicy: "cache-and-network",
  });
  return {
    data: (data ?? previousData)?.platformAnalytics ?? null,
    loading,
    error,
  };
}

export function useBusinessAnalytics(range: AnalyticsRange) {
  const { data, previousData, loading, error } = useQuery<{
    businessAnalytics: BusinessAnalytics;
  }>(BUSINESS_ANALYTICS, { variables: { range }, fetchPolicy: "cache-and-network" });
  return { data: (data ?? previousData)?.businessAnalytics ?? null, loading, error };
}

export function useBusinessItems(range: AnalyticsRange) {
  const { data, previousData, loading, error } = useQuery<{
    businessItemPerformance: ItemPerformance[];
  }>(BUSINESS_ITEM_PERFORMANCE, {
    variables: { range },
    fetchPolicy: "cache-and-network",
  });
  return {
    items: (data ?? previousData)?.businessItemPerformance ?? null,
    loading,
    error,
  };
}

export const SALES_PAGE_SIZE = 20;

export function useBusinessSales(range: AnalyticsRange, page: number) {
  const { data, previousData, loading, error } = useQuery<{
    businessSales: { nodes: Sale[]; pageInfo: SalesPageInfo };
  }>(BUSINESS_SALES, {
    variables: { range, page, pageSize: SALES_PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });
  const payload = (data ?? previousData)?.businessSales;
  return {
    rows: payload?.nodes ?? [],
    pageInfo: payload?.pageInfo ?? null,
    loading,
    error,
  };
}

export function useBusinessSearch(range: AnalyticsRange) {
  const { data, previousData, loading, error } = useQuery<{
    businessSearchInsights: SearchInsights;
  }>(BUSINESS_SEARCH_INSIGHTS, {
    variables: { range },
    fetchPolicy: "cache-and-network",
  });
  return {
    data: (data ?? previousData)?.businessSearchInsights ?? null,
    loading,
    error,
  };
}
