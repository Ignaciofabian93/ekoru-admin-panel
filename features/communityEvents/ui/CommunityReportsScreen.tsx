"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import Select from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useCommunityReports } from "../hooks/useCommunityReports";
import type { CommunityEventReport, CommunityReportStatus } from "../types";

const STATUSES: CommunityReportStatus[] = ["OPEN", "DISMISSED", "ACTIONED"];

/**
 * Moderation queue for community events (EK-23). A moderator dismisses a
 * report, or cancels the event: registrants are emailed and every open report
 * on that event closes with it.
 */
export function CommunityReportsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("communityEvents");
  const { navigateTo } = useNavigation();
  const {
    reports,
    pageInfo,
    loading,
    resolving,
    status,
    setStatus,
    page,
    setPage,
    resolve,
  } = useCommunityReports();

  const dismiss = (r: CommunityEventReport) => {
    const note = window.prompt(t("reports.dismissPrompt"), "");
    if (note === null) return;
    void resolve(r.id, "DISMISS", note);
  };

  const cancelEvent = (r: CommunityEventReport) => {
    const note = window.prompt(t("reports.cancelPrompt", { title: r.eventTitle }), "");
    if (note === null) return;
    void resolve(r.id, "CANCEL_EVENT", note);
  };

  const columns: Column<CommunityEventReport>[] = [
    {
      key: "event",
      header: t("reports.fields.event"),
      render: (r) => (
        <button
          type="button"
          className="text-left font-semibold hover:underline"
          onClick={() =>
            navigateTo({ route: `/${lang}/community-posts/${r.communityPostId}/edit` })
          }
        >
          {r.eventTitle}
          {r.eventStatus === "CANCELLED" && (
            <Text variant="small" color="tertiary">
              {` · ${t("cancelledBadge")}`}
            </Text>
          )}
        </button>
      ),
    },
    {
      key: "reason",
      header: t("reports.fields.reason"),
      render: (r) => (
        <div className="flex flex-col">
          <Text variant="span" weight="semibold">
            {t(`reports.reasons.${r.reason}`)}
          </Text>
          {r.details && (
            <Text variant="small" color="secondary">
              {r.details}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: "open",
      header: t("reports.fields.openOnEvent"),
      align: "center",
      render: (r) => (
        <Text variant="span" color="tertiary">
          {String(r.openReportsOnEvent)}
        </Text>
      ),
    },
    {
      key: "date",
      header: t("reports.fields.date"),
      render: (r) => (
        <Text variant="span" color="tertiary">
          {new Date(r.createdAt).toLocaleDateString(lang)}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) =>
        r.status === "OPEN" ? (
          <div className="flex justify-end gap-2">
            <MainButton
              text={t("reports.actions.dismiss")}
              variant="outline"
              size="sm"
              disabled={resolving}
              onPress={() => dismiss(r)}
            />
            {r.eventStatus !== "CANCELLED" && (
              <MainButton
                text={t("reports.actions.cancelEvent")}
                size="sm"
                disabled={resolving}
                onPress={() => cancelEvent(r)}
              />
            )}
          </div>
        ) : (
          <Text variant="small" color="tertiary">
            {r.resolutionNote ?? t(`reports.statuses.${r.status}`)}
          </Text>
        ),
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MODERATE_CONTENT"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-1">
          <Title level="h1" size="h3" weight="bold">
            {t("reports.title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("reports.subtitle")}
          </Text>
        </header>

        <div className="max-w-xs">
          <Select
            name="status"
            label={t("reports.fields.status")}
            options={STATUSES.map((s) => ({
              value: s,
              label: t(`reports.statuses.${s}`),
            }))}
            value={status}
            onChangeValue={(v) => setStatus(v as CommunityReportStatus)}
          />
        </div>

        <DataTable
          columns={columns}
          rows={reports}
          loading={loading}
          rowKey={(r) => String(r.id)}
          emptyLabel={t("reports.empty")}
        />

        {pageInfo && pageInfo.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Text variant="small" color="tertiary">
              {t("pagination.summary", {
                current: String(pageInfo.currentPage),
                total: String(pageInfo.totalPages),
                count: String(pageInfo.totalCount),
              })}
            </Text>
            <div className="flex gap-2">
              <MainButton
                text={t("pagination.prev")}
                variant="outline"
                size="sm"
                leftIcon={ChevronLeft}
                disabled={!pageInfo.hasPreviousPage}
                onPress={() => setPage(page - 1)}
              />
              <MainButton
                text={t("pagination.next")}
                variant="outline"
                size="sm"
                rightIcon={ChevronRight}
                disabled={!pageInfo.hasNextPage}
                onPress={() => setPage(page + 1)}
              />
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
