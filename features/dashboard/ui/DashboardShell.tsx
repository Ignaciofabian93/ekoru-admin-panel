"use client";

import { useEffect } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useIsAuthenticated, useIsHydrated } from "@/store/useAuthStore";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * Authenticated layout chrome shared by every dashboard route. The server-side
 * proxy already blocks unauthenticated access; this adds a client-side guard for
 * the edge case where the session cookie exists but `getMyData` failed to hydrate.
 */
export function DashboardShell({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const isHydrated = useIsHydrated();
  const isAuthenticated = useIsAuthenticated();
  const { replace } = useNavigation();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      replace({ route: `/${lang}/login` });
    }
  }, [isHydrated, isAuthenticated, lang, replace]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-secondary">
        <span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="sr-only">{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background-secondary">
      <Sidebar lang={lang} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
