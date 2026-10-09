"use client";

import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { displayTitle, type BlogPost } from "../types";

export function BlogPostsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("blogPosts");
  const { navigateTo } = useNavigation();
  const language = useGqlLanguage();
  const { posts, pageInfo, loading, search, setSearch, page, setPage } = useBlogPosts();

  const columns: Column<BlogPost>[] = [
    {
      key: "title",
      header: t("fields.title"),
      render: (p) => (
        <Text variant="span" weight="semibold">
          {displayTitle(p, language)}
        </Text>
      ),
    },
    {
      key: "reactions",
      header: t("fields.reactions"),
      align: "center",
      render: (p) => (
        <Text variant="span" color="tertiary">
          {`▲ ${p.likes} · ▼ ${p.dislikes}`}
        </Text>
      ),
    },
    {
      key: "published",
      header: t("fields.published"),
      align: "center",
      render: (p) => (
        <Badge tone={p.isPublished ? "success" : "neutral"}>
          {p.isPublished ? t("status.published") : t("status.draft")}
        </Badge>
      ),
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="WRITE_BLOG"
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
            onPress={() => navigateTo({ route: `/${lang}/blog-posts/new` })}
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
          rows={posts}
          loading={loading}
          rowKey={(p) => String(p.id)}
          emptyLabel={t("empty")}
          onRowClick={(p) => navigateTo({ route: `/${lang}/blog-posts/${p.id}/edit` })}
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
