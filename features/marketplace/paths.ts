import { type SupportedLanguage } from "@/constants/settings";

// One route per catalog table, matching the sidebar `to` values. Edit screens
// fetch their row by id through the raw list queries' `id` filter.

export const marketplacePaths = {
  departments: (lang: SupportedLanguage) => `/${lang}/departments`,
  departmentNew: (lang: SupportedLanguage) => `/${lang}/departments/new`,
  departmentEdit: (lang: SupportedLanguage, id: number) =>
    `/${lang}/departments/${id}/edit`,

  departmentCategories: (lang: SupportedLanguage) => `/${lang}/department-categories`,
  departmentCategoryNew: (lang: SupportedLanguage) =>
    `/${lang}/department-categories/new`,
  departmentCategoryEdit: (lang: SupportedLanguage, id: number) =>
    `/${lang}/department-categories/${id}/edit`,

  productCategories: (lang: SupportedLanguage) => `/${lang}/product-categories`,
  productCategoryNew: (lang: SupportedLanguage) => `/${lang}/product-categories/new`,
  productCategoryEdit: (lang: SupportedLanguage, id: number) =>
    `/${lang}/product-categories/${id}/edit`,
};
