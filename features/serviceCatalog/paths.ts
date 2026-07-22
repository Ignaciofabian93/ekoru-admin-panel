import { type SupportedLanguage } from "@/constants/settings";

// One route per service catalog table, matching the sidebar `to` values.

export const catalogPaths = {
  serviceCategories: (lang: SupportedLanguage) => `/${lang}/service-categories`,
  serviceCategoryNew: (lang: SupportedLanguage) => `/${lang}/service-categories/new`,
  serviceCategoryEdit: (lang: SupportedLanguage, id: number) =>
    `/${lang}/service-categories/${id}/edit`,

  serviceSubCategories: (lang: SupportedLanguage) => `/${lang}/service-subcategories`,
  serviceSubCategoryNew: (lang: SupportedLanguage) =>
    `/${lang}/service-subcategories/new`,
  serviceSubCategoryEdit: (lang: SupportedLanguage, id: number) =>
    `/${lang}/service-subcategories/${id}/edit`,
};
