"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import type { DocumentNode } from "graphql";
import {
  RAW_PERSON_MEMBERSHIP_TRANSLATIONS,
  RAW_PERSON_MEMBERSHIP_PRICING,
  RAW_BUSINESS_MEMBERSHIP_TRANSLATIONS,
  RAW_BUSINESS_MEMBERSHIP_PRICING,
} from "@/graphql/memberships/queries";
import {
  BULK_UPSERT_PERSON_MEMBERSHIPS,
  BULK_UPSERT_PERSON_MEMBERSHIP_TRANSLATIONS,
  BULK_UPSERT_PERSON_MEMBERSHIP_PRICING,
  BULK_UPSERT_BUSINESS_MEMBERSHIPS,
  BULK_UPSERT_BUSINESS_MEMBERSHIP_TRANSLATIONS,
  BULK_UPSERT_BUSINESS_MEMBERSHIP_PRICING,
} from "@/graphql/memberships/mutations";
import type { BulkResult } from "@/components/BulkImportDialog/BulkImportDialog";
import type { MembershipKind } from "../types";
import type {
  MembershipPricingUpsertRow,
  MembershipTranslationUpsertRow,
  MembershipUpsertRow,
  RawMembershipPricing,
  RawMembershipTranslation,
} from "../xlsx";

const EXPORT_PAGE_SIZE = 500;

/** Per-kind documents + connection field names for the raw reads and mutations. */
const OPS = {
  person: {
    translationsQuery: RAW_PERSON_MEMBERSHIP_TRANSLATIONS,
    translationsField: "rawPersonMembershipTranslations",
    pricingQuery: RAW_PERSON_MEMBERSHIP_PRICING,
    pricingField: "rawPersonMembershipPricing",
    base: BULK_UPSERT_PERSON_MEMBERSHIPS,
    baseField: "bulkUpsertPersonMemberships",
    translations: BULK_UPSERT_PERSON_MEMBERSHIP_TRANSLATIONS,
    translationsMutField: "bulkUpsertPersonMembershipTranslations",
    pricing: BULK_UPSERT_PERSON_MEMBERSHIP_PRICING,
    pricingMutField: "bulkUpsertPersonMembershipPricing",
  },
  business: {
    translationsQuery: RAW_BUSINESS_MEMBERSHIP_TRANSLATIONS,
    translationsField: "rawBusinessMembershipTranslations",
    pricingQuery: RAW_BUSINESS_MEMBERSHIP_PRICING,
    pricingField: "rawBusinessMembershipPricing",
    base: BULK_UPSERT_BUSINESS_MEMBERSHIPS,
    baseField: "bulkUpsertBusinessMemberships",
    translations: BULK_UPSERT_BUSINESS_MEMBERSHIP_TRANSLATIONS,
    translationsMutField: "bulkUpsertBusinessMembershipTranslations",
    pricing: BULK_UPSERT_BUSINESS_MEMBERSHIP_PRICING,
    pricingMutField: "bulkUpsertBusinessMembershipPricing",
  },
} as const;

type Conn<T> = { nodes: T[]; pageInfo: { hasNextPage: boolean } };

/**
 * Reads all translations + pricing for a membership kind (via the raw admin
 * queries) and exposes the base/translation/pricing bulk upserts — the commit
 * side of the XLSX import.
 */
export function useMembershipBulk(kind: MembershipKind) {
  const client = useApolloClient();
  const ops = OPS[kind];

  const [baseM] = useMutation<Record<string, BulkResult>>(ops.base);
  const [translationsM] = useMutation<Record<string, BulkResult>>(ops.translations);
  const [pricingM] = useMutation<Record<string, BulkResult>>(ops.pricing);

  const fetchAllPages = async <T>(query: DocumentNode, field: string): Promise<T[]> => {
    const all: T[] = [];
    for (let page = 1; page < 2000; page += 1) {
      const result = await client.query<Record<string, Conn<T>>>({
        query,
        variables: { page, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const conn = result.data?.[field];
      if (!conn) break;
      all.push(...conn.nodes);
      if (!conn.pageInfo.hasNextPage) break;
    }
    return all;
  };

  const fetchTranslations = () =>
    fetchAllPages<RawMembershipTranslation>(ops.translationsQuery, ops.translationsField);
  const fetchPricing = () =>
    fetchAllPages<RawMembershipPricing>(ops.pricingQuery, ops.pricingField);

  const commit =
    <T>(
      run: (rows: T[]) => Promise<{ data?: Record<string, BulkResult> | null }>,
      field: string,
    ) =>
    async (rows: T[]): Promise<BulkResult | null> => {
      try {
        const { data } = await run(rows);
        return data?.[field] ?? null;
      } catch {
        return null;
      }
    };

  return {
    fetchTranslations,
    fetchPricing,
    upsertData: commit<MembershipUpsertRow>(
      (rows) => baseM({ variables: { rows } }),
      ops.baseField,
    ),
    upsertTranslations: commit<MembershipTranslationUpsertRow>(
      (rows) => translationsM({ variables: { rows } }),
      ops.translationsMutField,
    ),
    upsertPricing: commit<MembershipPricingUpsertRow>(
      (rows) => pricingM({ variables: { rows } }),
      ops.pricingMutField,
    ),
  };
}
