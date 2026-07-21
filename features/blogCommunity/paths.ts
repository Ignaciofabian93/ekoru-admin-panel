import { type SupportedLanguage } from "@/constants/settings";

// One route per blog/community category table, matching the sidebar `to`
// values. Edit screens fetch their row by id through the raw list queries' `id`
// filter.

export const catalogPaths = {
  blogCategories: (lang: SupportedLanguage) => `/${lang}/blog-categories`,
  blogCategoryNew: (lang: SupportedLanguage) => `/${lang}/blog-categories/new`,
  blogCategoryEdit: (lang: SupportedLanguage, id: number) =>
    `/${lang}/blog-categories/${id}/edit`,

  communityCategories: (lang: SupportedLanguage) => `/${lang}/community-categories`,
  communityCategoryNew: (lang: SupportedLanguage) => `/${lang}/community-categories/new`,
  communityCategoryEdit: (lang: SupportedLanguage, id: number) =>
    `/${lang}/community-categories/${id}/edit`,

  communitySubCategories: (lang: SupportedLanguage) => `/${lang}/community-subcategories`,
  communitySubCategoryNew: (lang: SupportedLanguage) =>
    `/${lang}/community-subcategories/new`,
  communitySubCategoryEdit: (lang: SupportedLanguage, id: number) =>
    `/${lang}/community-subcategories/${id}/edit`,
};
