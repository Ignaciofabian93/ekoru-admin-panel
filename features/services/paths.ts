import { type SupportedLanguage } from "@/constants/settings";

const SEG = "services";

/** Routes for the services feature (matches the sidebar `to`). */
export const servicePaths = {
  list: (lang: SupportedLanguage) => `/${lang}/${SEG}`,
  new: (lang: SupportedLanguage) => `/${lang}/${SEG}/new`,
  edit: (lang: SupportedLanguage, id: number) => `/${lang}/${SEG}/${id}/edit`,
};
