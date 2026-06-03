/** Canonical admin origin. Override per-environment with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://admin.ekoru.cl"
).replace(/\/$/, "");

export const SITE_NAME = "Ekoru Admin";

/** BCP-47 locale tags used for the `<html lang>` attribute, keyed by app language code. */
export const HREFLANG: Record<string, string> = {
  es: "es-CL",
  en: "en-US",
  fr: "fr-FR",
};
