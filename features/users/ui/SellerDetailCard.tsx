"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type SupportedLanguage } from "@/constants/settings";
import { Badge } from "@/components/Badge/Badge";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import type { Seller } from "@/types/user";
import { sellerDisplayName } from "../types";
import { SellerActions } from "./SellerActions";
import { SellerStatusBadges } from "./SellerStatusBadges";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Text variant="small" color="tertiary">
        {label}
      </Text>
      <Text variant="span">{value || "—"}</Text>
    </div>
  );
}

export function SellerDetailCard({
  seller,
  lang,
  onChanged,
}: {
  seller: Seller;
  lang: SupportedLanguage;
  onChanged: () => void;
}) {
  const { t } = useTranslation("users");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href={`/${lang}/users`}
        className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-foreground-secondary hover:text-foreground"
      >
        <ArrowLeft size={16} />
        {t("detail.back")}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Title level="h1" size="h4" weight="bold">
            {sellerDisplayName(seller)}
          </Title>
          <Text variant="span" color="secondary">
            {seller.email}
          </Text>
          <span className="mt-1">
            <SellerStatusBadges seller={seller} />
          </span>
        </div>
        <Badge tone="neutral">{t(`sellerType.${seller.sellerType}`)}</Badge>
      </header>

      <section className="grid grid-cols-1 gap-4 rounded-lg border border-border-light bg-surface p-5 shadow-sm sm:grid-cols-2">
        <Field label={t("table.points")} value={String(seller.points ?? 0)} />
        <Field label={t("table.joined")} value={formatDate(seller.createdAt, lang)} />
        <Field label={t("detail.contact")} value={seller.phone} />
        <Field label="Website" value={seller.website} />
      </section>

      {/* Lifecycle actions — gated to MANAGE_USERS / BAN_USERS inside. */}
      <section>
        <SellerActions seller={seller} onChanged={() => onChanged()} />
      </section>
    </div>
  );
}
