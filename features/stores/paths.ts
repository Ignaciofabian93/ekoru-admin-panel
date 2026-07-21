import { type SupportedLanguage } from "@/constants/settings";

// One route per store catalog table, matching the sidebar `to` values. Edit
// screens fetch their row by id through the raw list queries' `id` filter.

export const storePaths = {
  storeCategories: (lang: SupportedLanguage) => `/${lang}/store-categories`,
  storeCategoryNew: (lang: SupportedLanguage) => `/${lang}/store-categories/new`,
  storeCategoryEdit: (lang: SupportedLanguage, id: number) =>
    `/${lang}/store-categories/${id}/edit`,

  storeSubCategories: (lang: SupportedLanguage) => `/${lang}/store-subcategories`,
  storeSubCategoryNew: (lang: SupportedLanguage) => `/${lang}/store-subcategories/new`,
  storeSubCategoryEdit: (lang: SupportedLanguage, id: number) =>
    `/${lang}/store-subcategories/${id}/edit`,
};
