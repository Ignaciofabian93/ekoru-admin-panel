"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  ADMIN_BLOG_POST,
  ADMIN_BLOG_POSTS,
  BLOG_CATEGORY_OPTIONS,
} from "@/graphql/blog/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { BlogCategoryOption, BlogPost, BlogPostPageInfo } from "../types";

const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];

type ListResult = {
  adminBlogPosts: { nodes: BlogPost[]; pageInfo: BlogPostPageInfo };
};
type DetailResult = { adminBlogPost: BlogPost | null };
type CategoryOptionsResult = {
  getBlogCategoryList: { id: number; translation: { name: string } | null }[];
};

/** Paginated admin blog-post list. */
export function useBlogPosts() {
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  const { data, loading, error, refetch } = useQuery<ListResult>(ADMIN_BLOG_POSTS, {
    variables: { page, pageSize, search: search || undefined },
    notifyOnNetworkStatusChange: true,
  });

  const setSearch = (value: string) => {
    setPage(1);
    setSearchState(value);
  };
  const setPageSize = (size: number) => {
    setPage(1);
    setPageSizeState(size);
  };

  return {
    posts: data?.adminBlogPosts.nodes ?? [],
    pageInfo: data?.adminBlogPosts.pageInfo,
    loading,
    error,
    refetch,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
  };
}

/** Single blog post for the edit screen. */
export function useBlogPost(id: number) {
  const { data, loading, error, refetch } = useQuery<DetailResult>(ADMIN_BLOG_POST, {
    variables: { id },
    skip: !Number.isFinite(id),
    notifyOnNetworkStatusChange: true,
  });
  return { post: data?.adminBlogPost ?? null, loading, error, refetch };
}

/** Blog category options for the form select (labelled by active language). */
export function useBlogCategoryOptions(): {
  options: BlogCategoryOption[];
  loading: boolean;
} {
  const language = useGqlLanguage();
  const { data, loading } = useQuery<CategoryOptionsResult>(BLOG_CATEGORY_OPTIONS, {
    variables: { language },
  });
  const options = (data?.getBlogCategoryList ?? []).map((c) => ({
    value: String(c.id),
    label: `${c.translation?.name ?? "—"} (#${c.id})`,
  }));
  return { options, loading };
}
