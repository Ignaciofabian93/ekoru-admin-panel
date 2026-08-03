import { type SupportedLanguage } from "@/constants/settings";

const SEG = "advertisements";

/** Routes for the advertisements feature (matches the sidebar `to`). */
export const advertisementPaths = {
  list: (lang: SupportedLanguage) => `/${lang}/${SEG}`,
  new: (lang: SupportedLanguage) => `/${lang}/${SEG}/new`,
  edit: (lang: SupportedLanguage, id: number) => `/${lang}/${SEG}/${id}/edit`,
};
