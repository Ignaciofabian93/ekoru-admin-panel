"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { type SupportedLanguage } from "@/constants/settings";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import Textarea from "@/components/Textarea/Textarea";
import { formatMoney } from "@/features/operations/types";
import { Pager } from "@/features/operations/ui/Pager";
import { StatusBadge } from "@/features/operations/ui/StatusBadge";
import { ADMIN_CANCEL_QUOTATION } from "@/graphql/operations/mutations";
import {
  COMPLETE_QUOTATION,
  REPLY_QUOTATION,
} from "@/graphql/businessServiceDesk/mutations";
import { BUSINESS_QUOTATIONS } from "@/graphql/businessServiceDesk/queries";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { useDeskAction } from "../hooks/useDeskAction";
import { NAMESPACE } from "../i18n";
import { clientName, type DeskQuotation, type Page } from "../types";

const PAGE_SIZE = 20;

/** The provider's reply: price, duration and terms, as on the web. */
function ReplyForm({
  quotation,
  busy,
  onSend,
  onClose,
}: {
  quotation: DeskQuotation;
  busy: boolean;
  onSend: (reply: { price: number; duration?: number; notes?: string }) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation(NAMESPACE);
  const toast = useToast();
  const [price, setPrice] = useState(
    quotation.estimatedPrice ? String(quotation.estimatedPrice) : "",
  );
  const [duration, setDuration] = useState(
    quotation.estimatedDuration ? String(quotation.estimatedDuration) : "",
  );
  const [notes, setNotes] = useState(quotation.providerNotes ?? "");

  return (
    <form
      className="flex flex-col gap-3 rounded-md bg-background-tertiary p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const amount = Number(price);
        if (!Number.isFinite(amount) || amount <= 0) {
          toast.error(t("quote.priceRequired"));
          return;
        }
        onSend({
          price: amount,
          duration: duration ? Number(duration) : undefined,
          notes: notes.trim() || undefined,
        });
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          name={`price-${quotation.id}`}
          type="number"
          label={t("quote.price")}
          value={price}
          onChangeText={setPrice}
        />
        <Input
          name={`duration-${quotation.id}`}
          type="number"
          label={t("quote.duration")}
          value={duration}
          onChangeText={setDuration}
        />
      </div>
      <Textarea
        name={`notes-${quotation.id}`}
        label={t("quote.notes")}
        placeholder={t("quote.notesPlaceholder")}
        value={notes}
        onChangeText={setNotes}
      />
      <div className="flex flex-wrap gap-2">
        <MainButton text={t("quote.send")} type="submit" size="sm" loading={busy} />
        <MainButton text={t("quote.close")} variant="ghost" size="sm" onPress={onClose} />
      </div>
    </form>
  );
}

/**
 * The quote requests the store received. A pending one is answered with a
 * price; an accepted one is completed when the work is done; either can be
 * cancelled while unpaid. Accepting and paying are the client's.
 */
export function QuotationsTab({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation(NAMESPACE);
  const [page, setPage] = useState(1);
  const [replying, setReplying] = useState<string | null>(null);
  const { data, loading, refetch } = useQuery<{
    myProviderQuotations: Page<DeskQuotation>;
  }>(BUSINESS_QUOTATIONS, {
    variables: { page, pageSize: PAGE_SIZE },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const { run, busy } = useDeskAction();
  const rows = data?.myProviderQuotations.nodes ?? [];

  const after = async (done: boolean) => {
    if (!done) return;
    setReplying(null);
    await refetch();
  };

  if (loading && !data) {
    return <div className="h-40 animate-pulse rounded-lg bg-background-tertiary" />;
  }
  if (rows.length === 0) {
    return (
      <Text variant="p" color="secondary">
        {t("feedback.emptyQuotations")}
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {rows.map((q) => {
          const open = q.status === "PENDING" || q.status === "ACCEPTED";
          const price = q.finalPrice ?? q.estimatedPrice;
          return (
            <li
              key={q.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <Text variant="span" weight="semibold">
                    #{q.id} · {q.title || q.service?.name || "—"}
                  </Text>
                  <Text variant="small" color="secondary">
                    {[
                      q.service?.name,
                      clientName(q.client),
                      q.client?.email,
                      q.client?.phone,
                      formatDate(q.createdAt, lang),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {price != null && (
                    <Text variant="span" weight="semibold">
                      {formatMoney(price)}
                    </Text>
                  )}
                  <StatusBadge value={q.status} />
                  {q.paidAt && <Badge tone="success">{t("quote.paid")}</Badge>}
                </div>
              </div>

              {(q.description || q.clientNotes) && (
                <div className="flex flex-col gap-1">
                  <Text variant="small" color="tertiary">
                    {t("quote.clientNotes")}
                  </Text>
                  <Text variant="small">
                    {[q.description, q.clientNotes].filter(Boolean).join(" — ")}
                  </Text>
                </div>
              )}
              {q.status === "PENDING" &&
                q.estimatedPrice != null &&
                replying !== q.id && (
                  <Text variant="small" color="secondary">
                    {t("quote.replied", { price: formatMoney(q.estimatedPrice) })}
                  </Text>
                )}

              {replying === q.id ? (
                <ReplyForm
                  quotation={q}
                  busy={busy === q.id}
                  onClose={() => setReplying(null)}
                  onSend={(reply) =>
                    void run(
                      q.id,
                      REPLY_QUOTATION,
                      {
                        input: {
                          id: q.id,
                          estimatedPrice: reply.price,
                          estimatedDuration: reply.duration,
                          providerNotes: reply.notes,
                        },
                      },
                      "feedback.replied",
                    ).then(after)
                  }
                />
              ) : (
                open && (
                  <div className="flex flex-wrap gap-2">
                    {q.status === "PENDING" && (
                      <MainButton
                        text={t("quote.reply")}
                        size="sm"
                        disabled={busy !== null}
                        onPress={() => setReplying(q.id)}
                      />
                    )}
                    {q.status === "ACCEPTED" && (
                      <MainButton
                        text={t("quote.complete")}
                        size="sm"
                        variant="outline"
                        disabled={busy !== null}
                        loading={busy === q.id}
                        onPress={() => {
                          if (!window.confirm(t("confirm.completeQuote", { id: q.id })))
                            return;
                          void run(
                            q.id,
                            COMPLETE_QUOTATION,
                            { id: q.id },
                            "feedback.completedQuote",
                          ).then(after);
                        }}
                      />
                    )}
                    {!q.paidAt && (
                      <MainButton
                        text={t("quote.cancel")}
                        size="sm"
                        variant="ghost"
                        disabled={busy !== null}
                        onPress={() => {
                          const reason = window.prompt(
                            t("prompts.cancelQuote", { id: q.id }),
                          );
                          if (reason === null) return;
                          void run(
                            q.id,
                            ADMIN_CANCEL_QUOTATION,
                            { id: q.id, reason: reason.trim() || undefined },
                            "feedback.cancelledQuote",
                          ).then(after);
                        }}
                      />
                    )}
                  </div>
                )
              )}
            </li>
          );
        })}
      </ul>
      <Pager
        pageInfo={data?.myProviderQuotations.pageInfo ?? null}
        page={page}
        setPage={setPage}
      />
    </div>
  );
}
