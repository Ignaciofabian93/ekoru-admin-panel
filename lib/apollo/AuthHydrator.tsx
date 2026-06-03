"use client";

import { useEffect } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { GET_ADMIN_ME } from "@/graphql/admin/auth";
import useAuthStore from "@/store/useAuthStore";
import type { Admin } from "@/types/admin";

export default function AuthHydrator() {
  const setAdmin = useAuthStore((s) => s.setAdmin);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [fetchMe] = useLazyQuery<{ getMyData: Admin | null }>(GET_ADMIN_ME, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (isHydrated) return;
    fetchMe()
      .then(({ data }) => {
        if (data?.getMyData) setAdmin(data.getMyData);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
    // Hydrate auth state once on mount; guarded by isHydrated above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
