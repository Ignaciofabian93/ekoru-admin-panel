"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { useLanguage } from "@/hooks/useLanguage";
import { toBackendLanguage, type BackendLanguage } from "@/utils/language";

/**
 * The active locale as the backend `Language` enum value (ES/EN/FR), ready to
 * pass as the `$language` variable of any GraphQL operation.
 */
export function useGqlLanguage(): BackendLanguage {
  const [lang] = useLanguage();
  return toBackendLanguage(lang as SupportedLanguage);
}
