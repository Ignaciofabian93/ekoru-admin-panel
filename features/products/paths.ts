import { type SupportedLanguage } from "@/constants/settings";

// Routes for the marketplace-products admin table, matching the sidebar `to`.

export const productPaths = {
  list: (lang: SupportedLanguage) => `/${lang}/products`,
  new: (lang: SupportedLanguage) => `/${lang}/products/new`,
  edit: (lang: SupportedLanguage, id: number) => `/${lang}/products/${id}/edit`,
};
