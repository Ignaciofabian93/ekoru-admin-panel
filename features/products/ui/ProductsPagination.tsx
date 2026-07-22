"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import MainButton from "@/components/Button/MainButton";
import { Select } from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import { PAGE_SIZE_OPTIONS } from "../hooks/useRawProducts";
import type { RawCatalogPageInfo } from "../types";

/** Shared pagination footer for the products list. */
export function ProductsPagination({
  pageInfo,
  page,
  setPage,
  pageSize,
  setPageSize,
}: {
  pageInfo?: RawCatalogPageInfo;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}) {
  const { t } = useTranslation("products");

  if (!pageInfo || pageInfo.totalCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <Text variant="small" color="tertiary">
          {t("pagination.summary", {
            current: String(pageInfo.currentPage),
            total: String(pageInfo.totalPages),
            count: String(pageInfo.totalCount),
          })}
        </Text>
        <div className="flex items-center gap-2">
          <Text variant="small" color="tertiary">
            {t("pagination.rowsPerPage")}
          </Text>
          <div className="w-20">
            <Select
              value={String(pageSize)}
              options={PAGE_SIZE_OPTIONS.map((n) => ({
                value: String(n),
                label: String(n),
              }))}
              onChangeValue={(v) => setPageSize(Number(v))}
            />
          </div>
        </div>
      </div>
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
