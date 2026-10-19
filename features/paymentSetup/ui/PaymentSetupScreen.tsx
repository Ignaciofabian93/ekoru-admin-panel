"use client";

import { CheckCircle2, ExternalLink, Info, Link2Off, Wallet } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { usePaymentSetup } from "../hooks/usePaymentSetup";
import { NAMESPACE } from "../i18n";

/**
 * Business area → Cobros. Where a store connects the Mercado Pago account its
 * buyers pay into (TRX-5). EKORU never holds the money: Mercado Pago splits
 * EKORU's commission off each sale at source.
 */
export function PaymentSetupScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation(NAMESPACE);
  const { setup, loading, canManage, finishing, busy, connect, unlink } = usePaymentSetup(
    { lang },
  );

  const percent = new Intl.NumberFormat(lang, {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(setup?.commissionRate ?? 0);
  const date = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(new Date(iso))
      : "—";

  const state = setup?.connected
    ? "connected"
    : setup?.needsReconnect
      ? "reconnect"
      : "disconnected";
  const tone =
    state === "connected" ? "success" : state === "reconnect" ? "warning" : "neutral";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Title level="h1" size="h3" weight="bold">
          {t("title")}
        </Title>
        <Text variant="p" color="secondary">
          {t("subtitle")}
        </Text>
      </header>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
        {loading || finishing ? (
          <div className="flex flex-col gap-2">
            <div className="h-6 w-40 animate-pulse rounded-md bg-background-tertiary" />
            <div className="h-16 animate-pulse rounded-md bg-background-tertiary" />
            {finishing && (
              <Text variant="small" color="secondary">
                {t("finishing")}
              </Text>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-lg bg-background-tertiary text-foreground-secondary">
                  <Wallet size={20} />
                </span>
                <div className="flex flex-col">
                  <Title level="h2" size="h5" weight="semibold">
                    Mercado Pago
                  </Title>
                  {setup?.accountId && (
                    <Text variant="span" size="sm" color="secondary">
                      {t("account", { id: setup.accountId })}
                    </Text>
                  )}
                </div>
              </div>
              <Badge tone={tone}>{t(`status.${state}`)}</Badge>
            </div>

            <Text variant="p" size="sm">
              {t(`explain.${state}`)}
            </Text>

            {state === "connected" && setup && (
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-0.5">
                  <Text variant="small" color="secondary">
                    {t("fields.environment")}
                  </Text>
                  <Text variant="span" size="sm" weight="medium">
                    {t(`environments.${setup.environment ?? "SANDBOX"}`)}
                  </Text>
                </div>
                <div className="flex flex-col gap-0.5">
                  <Text variant="small" color="secondary">
                    {t("fields.connectedAt")}
                  </Text>
                  <Text variant="span" size="sm" weight="medium">
                    {date(setup.connectedAt)}
                  </Text>
                </div>
                <div className="flex flex-col gap-0.5">
                  <Text variant="small" color="secondary">
                    {t("fields.renewsBefore")}
                  </Text>
                  <Text variant="span" size="sm" weight="medium">
                    {date(setup.tokenExpiresAt)}
                  </Text>
                </div>
              </dl>
            )}

            {canManage ? (
              <div className="flex flex-wrap gap-3">
                {state !== "connected" ? (
                  <MainButton
                    text={t(
                      state === "reconnect" ? "actions.reconnect" : "actions.connect",
                    )}
                    leftIcon={ExternalLink}
                    onPress={connect}
                    loading={busy}
                    disabled={busy}
                  />
                ) : (
                  <MainButton
                    text={t("actions.disconnect")}
                    variant="outline"
                    leftIcon={Link2Off}
                    onPress={unlink}
                    loading={busy}
                    disabled={busy}
                  />
                )}
              </div>
            ) : (
              <Text variant="small" color="secondary">
                {t("readOnly")}
              </Text>
            )}
          </>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-foreground-tertiary" />
          <Title level="h2" size="h6" weight="semibold">
            {t("how.title")}
          </Title>
        </div>
        <ul className="flex flex-col gap-2">
          {(["direct", "commission", "providerFee", "refunds"] as const).map((key) => (
            <li key={key} className="flex gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
              <Text variant="span" size="sm">
                {t(`how.${key}`, { percent })}
              </Text>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
