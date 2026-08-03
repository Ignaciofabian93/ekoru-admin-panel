import { type SupportedLanguage } from "@/constants/settings";

const SEG = "service-packages";

/** Routes for the service-packages feature (matches the sidebar `to`). */
export const servicePackagePaths = {
  list: (lang: SupportedLanguage) => `/${lang}/${SEG}`,
  new: (lang: SupportedLanguage) => `/${lang}/${SEG}/new`,
  edit: (lang: SupportedLanguage, id: number) => `/${lang}/${SEG}/${id}/edit`,
};
