"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import Select from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { ADMIN_SERVICE_REVIEWS, ADMIN_STORE_REVIEWS } from "@/graphql/operations/queries";
import {
  DELETE_SERVICE_REVIEW,
  DELETE_STORE_REVIEW,
} from "@/graphql/operations/mutations";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { useAction } from "../hooks/useAction";
import { usePagedQuery } from "../hooks/usePagedQuery";
import type { Party } from "../types";
import { Pager } from "./Pager";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean | null;
  createdAt: string;
  storeProductId?: number;
  userId?: string;
  serviceId?: number;
  reviewerId?: string;
  service?: { id: string; name: string } | null;
  reviewer?: Party;
};

const CONFIG = {
  store: {
    list: ADMIN_STORE_REVIEWS,
    field: "adminStoreProductReviews",
    remove: DELETE_STORE_REVIEW,
  },
  service: {
    list: ADMIN_SERVICE_REVIEWS,
    field: "adminServiceReviews",
    remove: DELETE_SERVICE_REVIEW,
  },
} as const;

/**
 * Review moderation (ADM-4) for store products or services. A moderator with
 * MODERATE_CONTENT removes an abusive or fake review; the rating it counted
 * towards is recomputed.
 */
export function ReviewsScreen({
  kind,
  lang,
}: {
  kind: "store" | "service";
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("operations");
  const cfg = CONFIG[kind];
  const { rows, pageInfo, loading, filters, setFilter, page, setPage, refetch } =
    usePagedQuery<ReviewRow, { rating: number | "" }>(cfg.list, cfg.field, {
      rating: "",
    });
  const remove = useAction(cfg.remove);

  const removeReview = async (r: ReviewRow) => {
    if (!window.confirm(t("reviews.removeConfirm"))) return;
    if (await remove.run({ id: Number(r.id) }, "reviews.feedback.removed")) {
      await refetch();
    }
  };

  const columns: Column<ReviewRow>[] = [
    {
      key: "subject",
      header: kind === "store" ? t("fields.product") : t("fields.service"),
      render: (r) =>
        kind === "store"
          ? t("orders.storeProduct", { id: String(r.storeProductId) })
          : (r.service?.name ?? `#${r.serviceId}`),
    },
    {
      key: "author",
      header: t("fields.author"),
      render: (r) => r.reviewer?.email ?? r.userId ?? r.reviewerId ?? "—",
    },
    {
      key: "rating",
      header: t("fields.rating"),
      align: "center",
      render: (r) => "★".repeat(r.rating) + "☆".repeat(Math.max(0, 5 - r.rating)),
    },
    {
      key: "comment",
      header: t("fields.comment"),
      render: (r) => (
        <div className="flex flex-col gap-1">
          <Text variant="span">{r.comment ?? "—"}</Text>
          {r.isVerifiedPurchase && <Badge tone="success">{t("reviews.verified")}</Badge>}
        </div>
      ),
    },
    {
      key: "date",
      header: t("fields.date"),
      render: (r) => formatDate(r.createdAt, lang),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex justify-end">
          <MainButton
            text={t("actions.remove")}
            variant="error"
            size="sm"
            disabled={remove.loading}
            onPress={() => void removeReview(r)}
          />
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
            {t(`reviews.${kind}Title`)}
          </Title>
          <Text variant="p" color="secondary">
            {t("reviews.subtitle")}
          </Text>
        </header>
        <div className="max-w-xs">
          <Select
            name="rating"
            label={t("fields.rating")}
            options={[
              { value: "", label: t("filters.all") },
              ...[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: "★".repeat(n) })),
            ]}
            value={filters.rating === "" ? "" : String(filters.rating)}
            onChangeValue={(v) => setFilter("rating", v ? Number(v) : "")}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(r) => r.id}
          emptyLabel={t("reviews.empty")}
        />
        <Pager pageInfo={pageInfo} page={page} setPage={setPage} />
      </div>
    </PermissionGate>
  );
}
