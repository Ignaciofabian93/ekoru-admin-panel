import { type SupportedLanguage } from "@/constants/settings";

// Routes for the store-products admin table, matching the sidebar `to` value.

export const storeProductPaths = {
  list: (lang: SupportedLanguage) => `/${lang}/store-products`,
  new: (lang: SupportedLanguage) => `/${lang}/store-products/new`,
  edit: (lang: SupportedLanguage, id: number) => `/${lang}/store-products/${id}/edit`,
};
