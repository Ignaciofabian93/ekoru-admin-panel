"use client";

import { useQuery } from "@apollo/client/react";
import { useState } from "react";

import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import Select from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import {
  ADMIN_CONVERSATION_MESSAGES,
  REPORTED_MESSAGES,
} from "@/graphql/operations/queries";
import {
  ADMIN_BLOCK_CONVERSATION,
  ADMIN_UNBLOCK_CONVERSATION,
  RESOLVE_MESSAGE_REPORT,
} from "@/graphql/operations/mutations";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { useAction } from "../hooks/useAction";
import { usePagedQuery } from "../hooks/usePagedQuery";
import type { Party } from "../types";
import { Pager } from "./Pager";

type Item = { id: number | string; name: string } | null;

type ReportRow = {
  id: number;
  body: string;
  masked: boolean;
  createdAt: string;
  reportedAt: string;
  reportReason: string | null;
  resolvedAt: string | null;
  sender: Party;
  reporter: Party;
  conversation: {
    id: number;
    itemType: "PRODUCT" | "STORE_PRODUCT" | "SERVICE";
    status: "OPEN" | "BLOCKED";
    blockedByAdmin: boolean;
    buyer: Party;
    seller: Party;
    product: Item;
    storeProduct: Item;
    service: Item;
  };
};

type ThreadMessage = {
  id: number;
  senderId: string | null;
  kind: "TEXT" | "SYSTEM";
  body: string;
  masked: boolean;
  createdAt: string;
};

/**
 * Chat moderation (ADM-14): messages participants reported, the thread
 * around each one, and the operator's moves. Resolving keeps the message;
 * blocking stops the thread for both sides until an operator lifts it.
 */
export function ChatModerationScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("operations");
  const { rows, pageInfo, loading, filters, setFilter, page, setPage, refetch } =
    usePagedQuery<ReportRow, { includeResolved: boolean | "" }>(
      REPORTED_MESSAGES,
      "reportedMessages",
      { includeResolved: "" },
    );
  const resolve = useAction(RESOLVE_MESSAGE_REPORT);
  const block = useAction(ADMIN_BLOCK_CONVERSATION);
  const unblock = useAction(ADMIN_UNBLOCK_CONVERSATION);
  const [open, setOpen] = useState<ReportRow | null>(null);
  const busy = resolve.loading || block.loading || unblock.loading;

  const act = async (ok: Promise<boolean>) => {
    if (await ok) await refetch();
  };

  const setBlocked = (r: ReportRow, blocked: boolean) => {
    if (blocked && !window.confirm(t("chats.blockConfirm"))) return;
    void act(
      (blocked ? block : unblock).run(
        { conversationId: r.conversation.id },
        blocked ? "chats.feedback.blocked" : "chats.feedback.unblocked",
      ),
    );
  };

  const itemName = (c: ReportRow["conversation"]) =>
    (c.product ?? c.storeProduct ?? c.service)?.name ?? `#${c.id}`;

  const columns: Column<ReportRow>[] = [
    {
      key: "reported",
      header: t("chats.fields.reported"),
      render: (r) => formatDate(r.reportedAt, lang),
    },
    {
      key: "message",
      header: t("chats.fields.message"),
      render: (r) => (
        <div className="flex max-w-md flex-col gap-1">
          <Text variant="span">{r.body}</Text>
          {r.reportReason && (
            <Text variant="small" color="secondary">
              {t("chats.fields.reason")}: {r.reportReason}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: "sender",
      header: t("chats.fields.sender"),
      render: (r) => r.sender?.email ?? "—",
    },
    {
      key: "reporter",
      header: t("chats.fields.reportedBy"),
      render: (r) => r.reporter?.email ?? "—",
    },
    {
      key: "item",
      header: t("chats.fields.item"),
      render: (r) => itemName(r.conversation),
    },
    {
      key: "state",
      header: t("fields.status"),
      render: (r) => (
        <div className="flex flex-col gap-1">
          <Badge tone={r.resolvedAt ? "neutral" : "warning"}>
            {r.resolvedAt ? t("chats.state.resolved") : t("chats.state.open")}
          </Badge>
          {r.conversation.status === "BLOCKED" && (
            <Badge tone="danger">{t("chats.state.blocked")}</Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex flex-wrap justify-end gap-2">
          <MainButton
            text={
              open?.id === r.id
                ? t("chats.actions.hideThread")
                : t("chats.actions.viewThread")
            }
            variant="outline"
            size="sm"
            onPress={() => setOpen(open?.id === r.id ? null : r)}
          />
          {!r.resolvedAt && (
            <MainButton
              text={t("chats.actions.resolve")}
              size="sm"
              disabled={busy}
              onPress={() =>
                void act(resolve.run({ messageId: r.id }, "chats.feedback.resolved"))
              }
            />
          )}
          {r.conversation.status === "OPEN" ? (
            <MainButton
              text={t("chats.actions.block")}
              variant="error"
              size="sm"
              disabled={busy}
              onPress={() => setBlocked(r, true)}
            />
          ) : (
            r.conversation.blockedByAdmin && (
              <MainButton
                text={t("chats.actions.unblock")}
                variant="outline"
                size="sm"
                disabled={busy}
                onPress={() => setBlocked(r, false)}
              />
            )
          )}
        </div>
      ),
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MODERATE_CONTENT"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-1">
          <Title level="h1" size="h3" weight="bold">
            {t("chats.title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("chats.subtitle")}
          </Text>
        </header>
        <div className="max-w-xs">
          <Select
            name="includeResolved"
            label={t("filters.status")}
            options={[
              { value: "", label: t("chats.filters.open") },
              { value: "true", label: t("chats.filters.all") },
            ]}
            value={filters.includeResolved === "" ? "" : "true"}
            onChangeValue={(v) => setFilter("includeResolved", v === "true" ? true : "")}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(r) => String(r.id)}
          emptyLabel={t("chats.empty")}
        />
        <Pager pageInfo={pageInfo} page={page} setPage={setPage} />
        {open && <ThreadPanel report={open} lang={lang} onClose={() => setOpen(null)} />}
      </div>
    </PermissionGate>
  );
}

/** The conversation around a report, oldest first, the reported line marked. */
function ThreadPanel({
  report,
  lang,
  onClose,
}: {
  report: ReportRow;
  lang: SupportedLanguage;
  onClose: () => void;
}) {
  const { t } = useTranslation("operations");
  const { data, loading } = useQuery<{
    adminConversationMessages: { nodes: ThreadMessage[]; hasMore: boolean };
  }>(ADMIN_CONVERSATION_MESSAGES, {
    variables: { conversationId: report.conversation.id },
    fetchPolicy: "network-only",
  });
  const messages = [...(data?.adminConversationMessages.nodes ?? [])].reverse();
  const { buyer, seller } = report.conversation;

  const who = (m: ThreadMessage) =>
    m.senderId === buyer?.id
      ? `${t("fields.buyer")} · ${buyer?.email ?? ""}`
      : m.senderId === seller?.id
        ? `${t("fields.seller")} · ${seller?.email ?? ""}`
        : "EKORU";

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border-light bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <Title level="h2" size="h5" weight="semibold">
          {t("chats.threadTitle", { id: String(report.conversation.id) })}
        </Title>
        <MainButton
          text={t("chats.actions.hideThread")}
          variant="ghost"
          size="sm"
          onPress={onClose}
        />
      </div>
      {loading && <Text variant="small">{t("loading")}</Text>}
      {data?.adminConversationMessages.hasMore && (
        <Text variant="small" color="secondary">
          {t("chats.olderHidden")}
        </Text>
      )}
      <ol className="flex flex-col gap-2">
        {messages.map((m) => (
          <li
            key={m.id}
            className={
              m.id === report.id
                ? "rounded-lg border border-red-300 bg-red-50 p-2"
                : "rounded-lg bg-background-secondary/60 p-2"
            }
          >
            <Text variant="small" color="secondary">
              {who(m)} · {formatDate(m.createdAt, lang)}
            </Text>
            <Text variant="p">{m.body}</Text>
          </li>
        ))}
      </ol>
    </section>
  );
}
