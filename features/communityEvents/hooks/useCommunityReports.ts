"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { COMMUNITY_EVENT_REPORTS } from "@/graphql/community/queries";
import { RESOLVE_COMMUNITY_EVENT_REPORT } from "@/graphql/community/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type {
  CommunityEventReport,
  CommunityPageInfo,
  CommunityReportAction,
  CommunityReportStatus,
} from "../types";

const PAGE_SIZE = 20;

type ReportsResult = {
  communityEventReports: { nodes: CommunityEventReport[]; pageInfo: CommunityPageInfo };
};

/** The community-event moderation queue (OPEN by default) and its two actions. */
export function useCommunityReports() {
  const toast = useToast();
  const { t } = useTranslation("communityEvents");
  const { t: tc } = useTranslation();
  const [status, setStatusState] = useState<CommunityReportStatus>("OPEN");
  const [page, setPage] = useState(1);

  const { data, loading, refetch } = useQuery<ReportsResult>(COMMUNITY_EVENT_REPORTS, {
    variables: { status, page, pageSize: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });
  const [resolveM, { loading: resolving }] = useMutation(RESOLVE_COMMUNITY_EVENT_REPORT);

  const setStatus = (value: CommunityReportStatus) => {
    setPage(1);
    setStatusState(value);
  };

  const resolve = async (
    id: number,
    action: CommunityReportAction,
    note: string,
  ): Promise<boolean> => {
    try {
      await resolveM({ variables: { id, action, note: note.trim() || null } });
      toast.success(
        t(
          action === "CANCEL_EVENT"
            ? "reports.feedback.cancelled"
            : "reports.feedback.dismissed",
        ),
      );
      await refetch();
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error && error.message ? error.message : tc("common.error"),
      );
      return false;
    }
  };

  return {
    reports: data?.communityEventReports.nodes ?? [],
    pageInfo: data?.communityEventReports.pageInfo ?? null,
    loading,
    resolving,
    status,
    setStatus,
    page,
    setPage,
    resolve,
  };
}
