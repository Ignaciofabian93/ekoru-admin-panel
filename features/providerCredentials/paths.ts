import { type SupportedLanguage } from "@/constants/settings";

const SEG = "provider-credentials";

/** Routes for the provider-credentials feature (matches the sidebar `to`). */
export const providerCredentialPaths = {
  list: (lang: SupportedLanguage) => `/${lang}/${SEG}`,
  new: (lang: SupportedLanguage) => `/${lang}/${SEG}/new`,
  edit: (lang: SupportedLanguage, id: number) => `/${lang}/${SEG}/${id}/edit`,
};
