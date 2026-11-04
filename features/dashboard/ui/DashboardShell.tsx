"use client";
import { useEffect } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useIsAuthenticated, useIsHydrated } from "@/store/useAuthStore";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

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
    <div className="min-h-screen bg-background-secondary">
      <Sidebar lang={lang} />
      <Topbar />
      <main className="ml-64 mt-16 h-[calc(100vh-4rem)] min-w-0 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
