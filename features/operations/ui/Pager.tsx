"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import MainButton from "@/components/Button/MainButton";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import type { PageInfo } from "../types";

/** Page summary with previous and next, shared by the operator lists. */
export function Pager({
  pageInfo,
  page,
  setPage,
}: {
  pageInfo: PageInfo | null;
  page: number;
  setPage: (page: number) => void;
}) {
  const { t } = useTranslation("operations");
  if (!pageInfo || pageInfo.totalPages <= 1) {
    return pageInfo ? (
      <Text variant="small" color="tertiary">
        {t("pagination.count", { count: String(pageInfo.totalCount) })}
      </Text>
    ) : null;
  }
  return (
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
  );
}
