"use client";

import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { IconButton } from "@/components/IconButton/IconButton";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { useCommunityEventRegistrations } from "../hooks/useCommunityEvents";
import { useCommunityEventMutations } from "../hooks/useCommunityEventMutations";
import type { CommunityEvent, CommunityRegistration } from "../types";

/**
 * Read-only registrations list for one event with per-row removal. Registrations
 * are created in the web app; the panel only lists and deletes (moderation).
 */
export function CommunityRegistrationsPanel({
  event,
  lang,
}: {
  event: CommunityEvent;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("communityEvents");
  const { registrations, pageInfo, loading, refetch, page, setPage } =
    useCommunityEventRegistrations(event.id);
  const { deleteRegistration, loading: mutating } = useCommunityEventMutations();

  const remove = async (reg: CommunityRegistration) => {
    if (!window.confirm(t("registrations.deleteConfirm", { name: reg.name }))) return;
    if (await deleteRegistration(reg.id)) void refetch();
  };

  const columns: Column<CommunityRegistration>[] = [
    {
      key: "name",
      header: t("registrations.name"),
      render: (r) => (
        <Text variant="span" weight="semibold">
          {r.name}
        </Text>
      ),
    },
    {
      key: "email",
      header: t("registrations.email"),
      render: (r) => (
        <Text variant="span" color="secondary">
          {r.email}
        </Text>
      ),
    },
    {
      key: "sellerId",
      header: t("registrations.profileId"),
      render: (r) => (
        <Text variant="span" color="tertiary">
          {r.sellerId ?? "—"}
        </Text>
      ),
    },
    {
      key: "createdAt",
      header: t("registrations.registeredAt"),
      render: (r) => (
        <Text variant="span" color="tertiary">
          {new Date(r.createdAt).toLocaleDateString(
            lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-US",
          )}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <IconButton
          icon={Trash2}
          tone="danger"
          label={t("registrations.delete")}
          disabled={mutating}
          onClick={(e) => {
            e.stopPropagation();
            void remove(r);
          }}
        />
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Title level="h2" size="h6" weight="semibold">
          {t("registrations.title")}
        </Title>
        <Text variant="small" color="tertiary">
          {event.capacity == null
            ? t("registrations.summaryUnlimited", {
                count: String(event.registrationCount),
              })
            : t("registrations.summary", {
                count: String(event.registrationCount),
                capacity: String(event.capacity),
                remaining: String(event.remainingCapacity ?? 0),
              })}
        </Text>
      </div>

      <DataTable
        columns={columns}
        rows={registrations}
        loading={loading}
        rowKey={(r) => String(r.id)}
        emptyLabel={t("registrations.empty")}
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
    </section>
  );
}
