import type { SupportedLanguage } from "@/constants/settings";
import type en from "./locales/en.json";

const loaders = {
  en: () => import("./locales/en.json").then((m) => m.default),
  es: () => import("./locales/es.json").then((m) => m.default),
  fr: () => import("./locales/fr.json").then((m) => m.default),
} satisfies Record<SupportedLanguage, () => Promise<unknown>>;

export const NAMESPACE = "paymentConfigs";

export type PaymentConfigsDictionary = typeof en;

export const getPaymentConfigsDictionary = (lang: SupportedLanguage) =>
  loaders[lang]() as Promise<PaymentConfigsDictionary>;
