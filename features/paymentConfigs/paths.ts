import { type SupportedLanguage } from "@/constants/settings";

const SEG = "payment-configs";

/** Routes for the payment-configs feature (matches the sidebar `to`). */
export const paymentConfigPaths = {
  list: (lang: SupportedLanguage) => `/${lang}/${SEG}`,
  new: (lang: SupportedLanguage) => `/${lang}/${SEG}/new`,
  edit: (lang: SupportedLanguage, id: string | number) => `/${lang}/${SEG}/${id}/edit`,
};
