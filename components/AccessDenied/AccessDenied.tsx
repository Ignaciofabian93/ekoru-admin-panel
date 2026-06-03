"use client";

import { ShieldAlert } from "lucide-react";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";

/**
 * Standard fallback for <PermissionGate>. Shown when an admin reaches a section
 * their `adminType` / permissions don't allow (e.g. a BUSINESS admin hitting a
 * platform-only route directly).
 */
export function AccessDenied() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <ShieldAlert size={24} />
      </span>
      <Title level="h2" size="h5" weight="semibold">
        {t("common.accessDenied")}
      </Title>
      <Text variant="p" color="secondary">
        {t("common.accessDeniedHint")}
      </Text>
    </div>
  );
}
