"use client";

import { Construction } from "lucide-react";
import { Badge } from "@/components/Badge/Badge";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";

/**
 * Placeholder body for feature areas that are wired into routing and the role
 * model but not yet built out. Each scaffold feature owns its own i18n namespace
 * (title/subtitle) and passes it here, so the structure stays consistent and
 * fully translated while the real CRUD is added later.
 */
export function ScaffoldScreen({
  namespace,
  titleKey = "title",
  subtitleKey = "subtitle",
}: {
  namespace: string;
  titleKey?: string;
  subtitleKey?: string;
}) {
  const { t } = useTranslation(namespace);
  const { t: tc } = useTranslation();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <Title level="h1" size="h3" weight="bold">
          {t(titleKey)}
        </Title>
        <Text variant="p" color="secondary">
          {t(subtitleKey)}
        </Text>
      </header>

      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface p-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-background-tertiary text-foreground-tertiary">
          <Construction size={24} />
        </span>
        <Badge tone="warning">{tc("common.comingSoon")}</Badge>
        <Text variant="p" color="tertiary">
          {tc("common.scaffoldNotice")}
        </Text>
      </div>
    </div>
  );
}
