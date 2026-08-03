import { type SupportedLanguage } from "@/constants/settings";

const SEG = "notification-templates";

/** Routes for the notification-templates feature (matches the sidebar `to`). */
export const notificationTemplatePaths = {
  list: (lang: SupportedLanguage) => `/${lang}/${SEG}`,
  new: (lang: SupportedLanguage) => `/${lang}/${SEG}/new`,
  edit: (lang: SupportedLanguage, id: number) => `/${lang}/${SEG}/${id}/edit`,
};
