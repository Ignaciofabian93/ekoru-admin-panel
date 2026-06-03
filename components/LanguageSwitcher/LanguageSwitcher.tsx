"use client";

import { Globe } from "lucide-react";
import { LANGUAGES_AVAILABLE } from "@/constants/settings";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/i18n/context";

/** Compact locale picker. Persists the choice via cookie and reroutes in place. */
export function LanguageSwitcher() {
  const [language, changeLanguage] = useLanguage();
  const { t } = useTranslation();

  return (
    <label className="relative inline-flex items-center">
      <Globe
        size={16}
        strokeWidth={2}
        className="pointer-events-none absolute left-2.5 text-foreground-tertiary"
      />
      <span className="sr-only">{t("common.language")}</span>
      <select
        aria-label={t("common.language")}
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="cursor-pointer appearance-none rounded-md border border-border-light bg-surface py-1.5 pl-8 pr-7 font-sans text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus:border-input-border-focus"
      >
        {LANGUAGES_AVAILABLE.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </label>
  );
}
