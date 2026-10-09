import type { Language } from "@/types/enums";

export const CATALOG_LANGUAGES = ["ES", "EN", "FR", "PT", "DE"] as const;
export type CatalogLanguage = (typeof CATALOG_LANGUAGES)[number];

export type BlogPostTranslation = {
  id: number;
  blogPostId: number;
  language: CatalogLanguage;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
};

export type BlogPost = {
  id: number;
  authorId: string;
  blogCategoryId: number;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  likes: number;
  dislikes: number;
  createdAt: string;
  updatedAt: string;
  translations: BlogPostTranslation[];
};

export type BlogPostPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

export type CreateBlogPostInput = {
  blogCategoryId: number;
  coverImage?: string | null;
  isPublished?: boolean;
};

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

export type UpsertBlogPostTranslationInput = {
  blogPostId: number;
  language: Language;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
};

export type BlogCategoryOption = { value: string; label: string };

/** Preferred display title: active UI language, then ES, then any. */
export function displayTitle(post: BlogPost, language: CatalogLanguage): string {
  const byLang = (l: CatalogLanguage) =>
    post.translations.find((t) => t.language === l)?.title;
  return byLang(language) ?? byLang("ES") ?? post.translations[0]?.title ?? "—";
}
