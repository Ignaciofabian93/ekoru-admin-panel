import type { SupportedLanguage } from "@/constants/settings";
import type en from "./locales/en.json";

const loaders = {
  en: () => import("./locales/en.json").then((m) => m.default),
  es: () => import("./locales/es.json").then((m) => m.default),
  fr: () => import("./locales/fr.json").then((m) => m.default),
} satisfies Record<SupportedLanguage, () => Promise<unknown>>;

export const NAMESPACE = "sellerLabels";

export type SellerLabelsDictionary = typeof en;

type NestedKeyOf<T extends object> = {
  [K in keyof T & string]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & string];

export type SellerLabelsKey = NestedKeyOf<SellerLabelsDictionary>;

export const getSellerLabelsDictionary = (lang: SupportedLanguage) =>
  loaders[lang]() as Promise<SellerLabelsDictionary>;
