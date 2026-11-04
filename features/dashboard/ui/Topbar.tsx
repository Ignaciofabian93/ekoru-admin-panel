"use client";
import { LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import { useAdminType, useDisplayName } from "@/store/useAuthStore";
import { useLogout } from "../hooks/useLogout";
import clsx from "clsx";

export function Topbar() {
  const { t } = useTranslation();
  const { t: td } = useTranslation("dashboard");
  const displayName = useDisplayName();
  const adminType = useAdminType();
  const { handleLogout, loading } = useLogout();

  const roleLabel =
    adminType === "PLATFORM" ? td("roleBadge.platform") : td("roleBadge.business");

  return (
    <header
      className={clsx(
        "absolute top-0 left-0 flex w-screen h-16 shrink-0 items-center justify-between",
        "bg-linear-90 from-primary via-secondary-dark to-primary px-6",
        "shadow-md shadow-slate-800/80",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <Text
            variant="span"
            weight="semibold"
            size="base"
            className="ml-2"
            color="white"
          >
            {displayName}
          </Text>
          {adminType && (
            <Text variant="span" weight="medium" size="xs" className="ml-2" color="white">
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
          className={clsx(
            "flex items-center gap-2 rounded-md px-3 py-2",
            "font-sans text-sm font-medium text-white bg-danger",
            "transition-all duration-200 ease-in-out hover:brightness-125 disabled:opacity-50",
            "cursor-pointer disabled:cursor-not-allowed",
          )}
        >
          <LogOut size={18} strokeWidth={2} />
          {t("common.logout")}
        </button>
      </div>
    </header>
  );
}
