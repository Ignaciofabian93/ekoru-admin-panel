"use client";

import { useMutation } from "@apollo/client/react";
import {
  CREATE_BLOG_POST,
  UPDATE_BLOG_POST,
  DELETE_BLOG_POST,
  UPSERT_BLOG_POST_TRANSLATION,
  DELETE_BLOG_POST_TRANSLATION,
} from "@/graphql/blog/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type {
  CreateBlogPostInput,
  UpdateBlogPostInput,
  UpsertBlogPostTranslationInput,
} from "../types";

/**
 * Create / update / delete blog posts and their translations. Each call toasts
 * success/failure and returns a boolean (or the new id for create) so screens
 * can navigate. Errors surface the backend message when present.
 */
export function useBlogPostMutations() {
  const toast = useToast();
  const { t } = useTranslation("blogPosts");
  const { t: tc } = useTranslation();

  const [createM, c1] = useMutation<{ createBlogPost: { id: number } }>(CREATE_BLOG_POST);
  const [updateM, c2] = useMutation(UPDATE_BLOG_POST);
  const [deleteM, c3] = useMutation(DELETE_BLOG_POST);
  const [upsertTrM, c4] = useMutation(UPSERT_BLOG_POST_TRANSLATION);
  const [deleteTrM, c5] = useMutation(DELETE_BLOG_POST_TRANSLATION);

  const loading = c1.loading || c2.loading || c3.loading || c4.loading || c5.loading;

  const fail = (error: unknown) => {
    const message = error instanceof Error ? error.message : "";
    toast.error(message || tc("common.error"));
  };

  const createPost = async (input: CreateBlogPostInput): Promise<number | null> => {
    try {
      const { data } = await createM({ variables: { input } });
      toast.success(t("feedback.created"));
      return data?.createBlogPost.id ?? null;
    } catch (error) {
      fail(error);
      return null;
    }
  };

  const updatePost = async (id: number, input: UpdateBlogPostInput): Promise<boolean> => {
    try {
      await updateM({ variables: { id, input } });
      toast.success(t("feedback.saved"));
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  const deletePost = async (id: number): Promise<boolean> => {
    try {
      await deleteM({ variables: { id } });
      toast.success(t("feedback.deleted"));
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  const upsertTranslation = async (
    input: UpsertBlogPostTranslationInput,
  ): Promise<boolean> => {
    try {
      await upsertTrM({ variables: { input } });
      toast.success(t("feedback.saved"));
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  const deleteTranslation = async (
    blogPostId: number,
    language: string,
  ): Promise<boolean> => {
    try {
      await deleteTrM({ variables: { blogPostId, language } });
      toast.success(t("feedback.deleted"));
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  return {
    loading,
    createPost,
    updatePost,
    deletePost,
    upsertTranslation,
    deleteTranslation,
  };
}
