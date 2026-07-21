"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  ADMIN_COMMUNITY_EVENT,
  ADMIN_COMMUNITY_EVENTS,
  COMMUNITY_EVENT_REGISTRATIONS,
} from "@/graphql/community/queries";
import type { CommunityEvent, CommunityPageInfo, CommunityRegistration } from "../types";

const DEFAULT_PAGE_SIZE = 20;

type ListResult = {
  adminCommunityEvents: { nodes: CommunityEvent[]; pageInfo: CommunityPageInfo };
};
type DetailResult = { adminCommunityEvent: CommunityEvent | null };
type RegistrationsResult = {
  communityEventRegistrations: {
    nodes: CommunityRegistration[];
    pageInfo: CommunityPageInfo;
  };
};

/** Paginated admin community-event list. */
export function useCommunityEvents() {
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  const { data, loading, error, refetch } = useQuery<ListResult>(ADMIN_COMMUNITY_EVENTS, {
    variables: { page, pageSize, search: search || undefined },
    notifyOnNetworkStatusChange: true,
  });

  const setSearch = (value: string) => {
    setPage(1);
    setSearchState(value);
  };

  return {
    events: data?.adminCommunityEvents.nodes ?? [],
    pageInfo: data?.adminCommunityEvents.pageInfo,
    loading,
    error,
    refetch,
    search,
    setSearch,
    page,
    setPage,
  };
}

/** Single community event for the edit screen. */
export function useCommunityEvent(id: number) {
  const { data, loading, error, refetch } = useQuery<DetailResult>(
    ADMIN_COMMUNITY_EVENT,
    {
      variables: { id },
      skip: !Number.isFinite(id),
      notifyOnNetworkStatusChange: true,
    },
  );
  return { event: data?.adminCommunityEvent ?? null, loading, error, refetch };
}

/** Paginated registrations for one event (read-only list). */
export function useCommunityEventRegistrations(eventId: number) {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useQuery<RegistrationsResult>(
    COMMUNITY_EVENT_REGISTRATIONS,
    {
      variables: { eventId, page, pageSize: 50 },
      skip: !Number.isFinite(eventId),
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    registrations: data?.communityEventRegistrations.nodes ?? [],
    pageInfo: data?.communityEventRegistrations.pageInfo,
    loading,
    error,
    refetch,
    page,
    setPage,
  };
}
