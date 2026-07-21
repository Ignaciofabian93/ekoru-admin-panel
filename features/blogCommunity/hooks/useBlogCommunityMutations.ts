"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_BLOG_CATEGORIES,
  BULK_UPSERT_BLOG_CATEGORY_TRANSLATIONS,
  BULK_UPSERT_COMMUNITY_CATEGORIES,
  BULK_UPSERT_COMMUNITY_CATEGORY_TRANSLATIONS,
  BULK_UPSERT_COMMUNITY_SUB_CATEGORIES,
  BULK_UPSERT_COMMUNITY_SUB_CATEGORY_TRANSLATIONS,
  DELETE_BLOG_CATEGORY,
  DELETE_BLOG_CATEGORY_TRANSLATION,
  DELETE_COMMUNITY_CATEGORY,
  DELETE_COMMUNITY_CATEGORY_TRANSLATION,
  DELETE_COMMUNITY_SUB_CATEGORY,
  DELETE_COMMUNITY_SUB_CATEGORY_TRANSLATION,
} from "@/graphql/blogCommunity/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type {
  BlogCategoryTranslationUpsertRow,
  BlogCategoryUpsertRow,
  BulkUpsertResult,
  CommunityCategoryTranslationUpsertRow,
  CommunityCategoryUpsertRow,
  CommunitySubCategoryTranslationUpsertRow,
  CommunitySubCategoryUpsertRow,
} from "../types";

/**
 * Writes for the blog & community catalog tables. Each `upsert*` maps to a
 * backend bulk mutation: a one-row array is a row edit / create, a many-row
 * array is an XLSX import. With `notify` (default) a fully successful batch
 * toasts success and a batch with row failures toasts the first row error; pass
 * `notify: false` when the caller reports results itself (the import dialog).
 */
export function useBlogCommunityMutations() {
  const toast = useToast();
  const { t } = useTranslation("blogCommunity");

  const [blogCatM, s1] = useMutation<{
    bulkUpsertBlogCategories: BulkUpsertResult;
  }>(BULK_UPSERT_BLOG_CATEGORIES);
  const [blogCatTrM, s2] = useMutation<{
    bulkUpsertBlogCategoryTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_BLOG_CATEGORY_TRANSLATIONS);
  const [commCatM, s3] = useMutation<{
    bulkUpsertCommunityCategories: BulkUpsertResult;
  }>(BULK_UPSERT_COMMUNITY_CATEGORIES);
  const [commCatTrM, s4] = useMutation<{
    bulkUpsertCommunityCategoryTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_COMMUNITY_CATEGORY_TRANSLATIONS);
  const [commSubM, s5] = useMutation<{
    bulkUpsertCommunitySubCategories: BulkUpsertResult;
  }>(BULK_UPSERT_COMMUNITY_SUB_CATEGORIES);
  const [commSubTrM, s6] = useMutation<{
    bulkUpsertCommunitySubCategoryTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_COMMUNITY_SUB_CATEGORY_TRANSLATIONS);

  const [delBlogCatM, d1] = useMutation(DELETE_BLOG_CATEGORY);
  const [delBlogCatTrM, d2] = useMutation(DELETE_BLOG_CATEGORY_TRANSLATION);
  const [delCommCatM, d3] = useMutation(DELETE_COMMUNITY_CATEGORY);
  const [delCommCatTrM, d4] = useMutation(DELETE_COMMUNITY_CATEGORY_TRANSLATION);
  const [delCommSubM, d5] = useMutation(DELETE_COMMUNITY_SUB_CATEGORY);
  const [delCommSubTrM, d6] = useMutation(DELETE_COMMUNITY_SUB_CATEGORY_TRANSLATION);

  const loading =
    s1.loading ||
    s2.loading ||
    s3.loading ||
    s4.loading ||
    s5.loading ||
    s6.loading ||
    d1.loading ||
    d2.loading ||
    d3.loading ||
    d4.loading ||
    d5.loading ||
    d6.loading;

  const reportBulk = (
    result: BulkUpsertResult | null | undefined,
    notify: boolean,
  ): BulkUpsertResult | null => {
    if (!result) {
      if (notify) toast.error(t("feedback.error"));
      return null;
    }
    if (notify) {
      if (result.failed > 0) {
        toast.error(
          t("feedback.rowsFailed", {
            count: String(result.failed),
            message: result.errors[0]?.message ?? "",
          }),
        );
      } else {
        toast.success(t("feedback.saved"));
      }
    }
    return result;
  };

  const runBulk = async (
    action: () => Promise<BulkUpsertResult | null | undefined>,
    notify: boolean,
  ): Promise<BulkUpsertResult | null> => {
    try {
      return reportBulk(await action(), notify);
    } catch (error) {
      if (notify) {
        const message = error instanceof Error ? error.message : "";
        toast.error(message || t("feedback.error"));
      }
      return null;
    }
  };

  const runDelete = async (action: () => Promise<unknown>): Promise<boolean> => {
    try {
      await action();
      toast.success(t("feedback.deleted"));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(message || t("feedback.error"));
      return false;
    }
  };

  return {
    loading,

    // ── Blog categories ──
    upsertBlogCategories: (rows: BlogCategoryUpsertRow[], notify = true) =>
      runBulk(async () => {
        const { data } = await blogCatM({ variables: { rows } });
        return data?.bulkUpsertBlogCategories;
      }, notify),
    upsertBlogCategoryTranslations: (
      rows: BlogCategoryTranslationUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await blogCatTrM({ variables: { rows } });
        return data?.bulkUpsertBlogCategoryTranslations;
      }, notify),
    removeBlogCategory: (id: number) =>
      runDelete(() => delBlogCatM({ variables: { id } })),
    removeBlogCategoryTranslation: (id: number) =>
      runDelete(() => delBlogCatTrM({ variables: { id } })),

    // ── Community categories ──
    upsertCommunityCategories: (rows: CommunityCategoryUpsertRow[], notify = true) =>
      runBulk(async () => {
        const { data } = await commCatM({ variables: { rows } });
        return data?.bulkUpsertCommunityCategories;
      }, notify),
    upsertCommunityCategoryTranslations: (
      rows: CommunityCategoryTranslationUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await commCatTrM({ variables: { rows } });
        return data?.bulkUpsertCommunityCategoryTranslations;
      }, notify),
    removeCommunityCategory: (id: number) =>
      runDelete(() => delCommCatM({ variables: { id } })),
    removeCommunityCategoryTranslation: (id: number) =>
      runDelete(() => delCommCatTrM({ variables: { id } })),

    // ── Community sub categories ──
    upsertCommunitySubCategories: (
      rows: CommunitySubCategoryUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await commSubM({ variables: { rows } });
        return data?.bulkUpsertCommunitySubCategories;
      }, notify),
    upsertCommunitySubCategoryTranslations: (
      rows: CommunitySubCategoryTranslationUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await commSubTrM({ variables: { rows } });
        return data?.bulkUpsertCommunitySubCategoryTranslations;
      }, notify),
    removeCommunitySubCategory: (id: number) =>
      runDelete(() => delCommSubM({ variables: { id } })),
    removeCommunitySubCategoryTranslation: (id: number) =>
      runDelete(() => delCommSubTrM({ variables: { id } })),
  };
}
