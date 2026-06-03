"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Logout } from "@/lib/api/auth";
import { DEFAULT_LANGUAGE, type SupportedLanguage } from "@/constants/settings";
import { useNavigation } from "@/hooks/useNavigation";
import useAuthStore from "@/store/useAuthStore";

export function useLogout() {
  const logoutStore = useAuthStore((s) => s.logout);
  const { replace, refresh } = useNavigation();
  const params = useParams<{ lang?: SupportedLanguage }>();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await Logout();
    } catch {
      // Clearing local state below is enough even if the gateway call fails.
    } finally {
      logoutStore();
      const lang = params.lang ?? DEFAULT_LANGUAGE;
      replace({ route: `/${lang}/login` });
      refresh();
      setLoading(false);
    }
  };

  return { handleLogout, loading };
}
