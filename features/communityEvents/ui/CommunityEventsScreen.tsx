"use client";

import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useCommunityEvents } from "../hooks/useCommunityEvents";
import { formatEventDates } from "../utils";
import type { CommunityEvent } from "../types";

export function CommunityEventsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("communityEvents");
  const { navigateTo } = useNavigation();
  const { events, pageInfo, loading, search, setSearch, page, setPage } =
    useCommunityEvents();

  const columns: Column<CommunityEvent>[] = [
    {
      key: "title",
      header: t("fields.title"),
      render: (e) => (
        <Text variant="span" weight="semibold">
          {e.title}
        </Text>
      ),
    },
    {
      key: "dates",
      header: t("fields.dates"),
      render: (e) => (
        <Text variant="span" color="secondary">
          {formatEventDates(e.startDate, e.endDate, lang) || t("noDates")}
        </Text>
      ),
    },
    {
      key: "capacity",
      header: t("fields.capacity"),
      align: "center",
      render: (e) => (
        <Text variant="span" color="tertiary">
          {e.capacity == null ? t("unlimited") : `${e.registrationCount} / ${e.capacity}`}
        </Text>
      ),
    },
    {
      key: "registrations",
      header: t("fields.registrations"),
      align: "center",
      render: (e) => (
        <Text variant="span" color="tertiary">
          {String(e.registrationCount)}
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
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Title level="h1" size="h3" weight="bold">
              {t("title")}
            </Title>
            <Text variant="p" color="secondary">
              {t("subtitle")}
            </Text>
          </div>
          <MainButton
            text={t("actions.new")}
            leftIcon={Plus}
            size="sm"
            onPress={() => navigateTo({ route: `/${lang}/community-posts/new` })}
          />
        </header>

        <div className="max-w-sm">
          <Input
            name="search"
            type="search"
            placeholder={t("searchPlaceholder")}
            leftIcon={Search}
            value={search}
            onChangeText={setSearch}
          />
        </div>

        <DataTable
          columns={columns}
          rows={events}
          loading={loading}
          rowKey={(e) => String(e.id)}
          emptyLabel={t("empty")}
          onRowClick={(e) =>
            navigateTo({ route: `/${lang}/community-posts/${e.id}/edit` })
          }
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
