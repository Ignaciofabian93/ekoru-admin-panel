"use client";

import { Search } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { useSellers } from "../hooks/useSellers";
import { UsersTable } from "./UsersTable";

export function UsersScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("users");
  const { sellers, loading, search, setSearch } = useSellers();

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_USERS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-1">
          <Title level="h1" size="h3" weight="bold">
            {t("title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("subtitle")}
          </Text>
        </header>

        <div className="max-w-sm">
          <Input
            name="search"
            type="search"
            placeholder={t("searchPlaceholder")}
            leftIcon={Search}
            value={search}
            onChangeText={setSearch}
          />
        </div>

        <UsersTable sellers={sellers} loading={loading} lang={lang} />
      </div>
    </PermissionGate>
  );
}
