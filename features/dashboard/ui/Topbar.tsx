"use client";

import { LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import { useAdminType, useDisplayName, useInitials } from "@/store/useAuthStore";
import { useLogout } from "../hooks/useLogout";

export function Topbar() {
  const { t } = useTranslation();
  const { t: td } = useTranslation("dashboard");
  const displayName = useDisplayName();
  const initials = useInitials();
  const adminType = useAdminType();
  const { handleLogout, loading } = useLogout();

  const roleLabel =
    adminType === "PLATFORM" ? td("roleBadge.platform") : td("roleBadge.business");

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-surface px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary font-sans text-sm font-bold text-white">
          {initials}
        </div>
        <div className="flex flex-col">
          <Text variant="span" weight="semibold" size="base" className="ml-2">
            {displayName}
          </Text>
          {adminType && (
            <Text variant="span" weight="medium" size="xs" className="ml-2">
              {roleLabel}
            </Text>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 rounded-md px-3 py-2 font-sans text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-danger disabled:opacity-50"
        >
          <LogOut size={18} strokeWidth={2} />
          {t("common.logout")}
        </button>
      </div>
    </header>
  );
}
