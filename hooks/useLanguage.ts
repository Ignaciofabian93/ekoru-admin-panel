"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE } from "@/constants/settings";
import { setCookie } from "@/utils/cookies";

/**
 * Reads the active locale from the `[lang]` route segment and returns a setter
 * that persists the choice (cookie, so middleware honors it on cold visits) and
 * navigates to the same path under the new locale.
 */
export function useLanguage(): [string, (code: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const language = typeof params?.lang === "string" ? params.lang : DEFAULT_LANGUAGE;

  const changeLanguage = (code: string) => {
    if (code === language) return;
    setCookie(LANGUAGE_COOKIE, code);
    const segments = pathname.split("/");
    segments[1] = code; // swap the leading `/[lang]` segment
    router.push(segments.join("/"));
  };

  return [language, changeLanguage];
}
