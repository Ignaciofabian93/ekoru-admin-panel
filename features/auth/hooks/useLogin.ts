"use client";
import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import { useLazyQuery } from "@apollo/client/react";
import { Login } from "@/lib/api/auth";
import { GET_ADMIN_ME } from "@/graphql/admin/auth";
import { DEFAULT_LANGUAGE, type SupportedLanguage } from "@/constants/settings";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/useToast";
import useAuthStore from "@/store/useAuthStore";
import type { Admin } from "@/types/admin";

export function useLogin() {
  const { replace, refresh } = useNavigation();
  const params = useParams<{ lang?: SupportedLanguage }>();
  const searchParams = useSearchParams();
  const setAdmin = useAuthStore((s) => s.setAdmin);
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [fetchMe] = useLazyQuery<{ getMyData: Admin | null }>(GET_ADMIN_ME, {
    fetchPolicy: "network-only",
  });

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Normalize email to match how it was stored; a trailing space or capital
      // from autocomplete would otherwise cause a 400 / "user not found".
      await Login({ email: email.trim().toLowerCase(), password: password.trim() });
      const { data } = await fetchMe();
      if (data?.getMyData) setAdmin(data.getMyData);
      const lang = params.lang ?? DEFAULT_LANGUAGE;
      const redirectTo = searchParams.get("redirectTo") ?? `/${lang}`;
      replace({ route: redirectTo });
      refresh();
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { message?: string } | undefined)?.message ??
          err.message)
        : "Unexpected error";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleSubmit,
  };
}
