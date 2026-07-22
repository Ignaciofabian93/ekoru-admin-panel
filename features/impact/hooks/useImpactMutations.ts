"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_MATERIAL_IMPACTS,
  BULK_UPSERT_MATERIAL_IMPACT_TRANSLATIONS,
  BULK_UPSERT_WATER_IMPACTS,
  BULK_UPSERT_WATER_IMPACT_TRANSLATIONS,
  BULK_UPSERT_CO2_IMPACTS,
  BULK_UPSERT_CO2_IMPACT_TRANSLATIONS,
  DELETE_MATERIAL_IMPACT,
  DELETE_MATERIAL_IMPACT_TRANSLATION,
  DELETE_WATER_IMPACT,
  DELETE_WATER_IMPACT_TRANSLATION,
  DELETE_CO2_IMPACT,
  DELETE_CO2_IMPACT_TRANSLATION,
} from "@/graphql/impact/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type {
  BulkUpsertResult,
  ImpactMessageKind,
  ImpactMessageTranslationUpsertRow,
  ImpactMessageUpsertRow,
  MaterialImpactTranslationUpsertRow,
  MaterialImpactUpsertRow,
} from "../types";

/**
 * Writes for the marketplace impact tables. Each `upsert*` maps to a backend
 * bulk mutation: a one-row array is a row edit / create, a many-row array is an
 * XLSX import. With `notify` (default) a fully successful batch toasts success
 * and a batch with row failures toasts the first row error; pass `notify: false`
 * when the caller reports results itself (the import dialog).
 */
export function useImpactMutations() {
  const toast = useToast();
  const { t } = useTranslation("impact");

  const [matM, s1] = useMutation<{
    bulkUpsertMaterialImpactEstimates: BulkUpsertResult;
  }>(BULK_UPSERT_MATERIAL_IMPACTS);
  const [matTrM, s2] = useMutation<{
    bulkUpsertMaterialImpactEstimateTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_MATERIAL_IMPACT_TRANSLATIONS);
  const [waterM, s3] = useMutation<{
    bulkUpsertWaterImpactMessages: BulkUpsertResult;
  }>(BULK_UPSERT_WATER_IMPACTS);
  const [waterTrM, s4] = useMutation<{
    bulkUpsertWaterImpactMessageTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_WATER_IMPACT_TRANSLATIONS);
  const [co2M, s5] = useMutation<{
    bulkUpsertCo2ImpactMessages: BulkUpsertResult;
  }>(BULK_UPSERT_CO2_IMPACTS);
  const [co2TrM, s6] = useMutation<{
    bulkUpsertCo2ImpactMessageTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_CO2_IMPACT_TRANSLATIONS);

  const [delMatM, d1] = useMutation(DELETE_MATERIAL_IMPACT);
  const [delMatTrM, d2] = useMutation(DELETE_MATERIAL_IMPACT_TRANSLATION);
  const [delWaterM, d3] = useMutation(DELETE_WATER_IMPACT);
  const [delWaterTrM, d4] = useMutation(DELETE_WATER_IMPACT_TRANSLATION);
  const [delCo2M, d5] = useMutation(DELETE_CO2_IMPACT);
  const [delCo2TrM, d6] = useMutation(DELETE_CO2_IMPACT_TRANSLATION);

  const loading =
    s1.loading ||
    s2.loading ||
    s3.loading ||
    s4.loading ||
    s5.loading ||
    s6.loading ||
    d1.loading ||
    d2.loading ||
    d3.loading ||
    d4.loading ||
    d5.loading ||
    d6.loading;

  const reportBulk = (
    result: BulkUpsertResult | null | undefined,
    notify: boolean,
  ): BulkUpsertResult | null => {
    if (!result) {
      if (notify) toast.error(t("feedback.error"));
      return null;
    }
    if (notify) {
      if (result.failed > 0) {
        toast.error(
          t("feedback.rowsFailed", {
            count: String(result.failed),
            message: result.errors[0]?.message ?? "",
          }),
        );
      } else {
        toast.success(t("feedback.saved"));
      }
    }
    return result;
  };

  const runBulk = async (
    action: () => Promise<BulkUpsertResult | null | undefined>,
    notify: boolean,
  ): Promise<BulkUpsertResult | null> => {
    try {
      return reportBulk(await action(), notify);
    } catch (error) {
      if (notify) {
        const message = error instanceof Error ? error.message : "";
        toast.error(message || t("feedback.error"));
      }
      return null;
    }
  };

  const runDelete = async (action: () => Promise<unknown>): Promise<boolean> => {
    try {
      await action();
      toast.success(t("feedback.deleted"));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(message || t("feedback.error"));
      return false;
    }
  };

  // Per-kind closures read the correctly-typed result key (dynamic indexing on
  // the union of mutation results would not typecheck).
  const messageUpsert: Record<
    ImpactMessageKind,
    (rows: ImpactMessageUpsertRow[]) => Promise<BulkUpsertResult | undefined>
  > = {
    water: async (rows) =>
      (await waterM({ variables: { rows } })).data?.bulkUpsertWaterImpactMessages,
    co2: async (rows) =>
      (await co2M({ variables: { rows } })).data?.bulkUpsertCo2ImpactMessages,
  };
  const messageTrUpsert: Record<
    ImpactMessageKind,
    (rows: ImpactMessageTranslationUpsertRow[]) => Promise<BulkUpsertResult | undefined>
  > = {
    water: async (rows) =>
      (await waterTrM({ variables: { rows } })).data
        ?.bulkUpsertWaterImpactMessageTranslations,
    co2: async (rows) =>
      (await co2TrM({ variables: { rows } })).data
        ?.bulkUpsertCo2ImpactMessageTranslations,
  };
  const messageDeleteMap = { water: delWaterM, co2: delCo2M } as const;
  const messageTrDeleteMap = { water: delWaterTrM, co2: delCo2TrM } as const;

  return {
    loading,

    // ── Material impact estimates ──
    upsertMaterialImpacts: (rows: MaterialImpactUpsertRow[], notify = true) =>
      runBulk(async () => {
        const { data } = await matM({ variables: { rows } });
        return data?.bulkUpsertMaterialImpactEstimates;
      }, notify),
    upsertMaterialImpactTranslations: (
      rows: MaterialImpactTranslationUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await matTrM({ variables: { rows } });
        return data?.bulkUpsertMaterialImpactEstimateTranslations;
      }, notify),
    removeMaterialImpact: (id: number) => runDelete(() => delMatM({ variables: { id } })),
    removeMaterialImpactTranslation: (id: number) =>
      runDelete(() => delMatTrM({ variables: { id } })),

    // ── Impact messages (water / co2) ──
    upsertMessages: (
      kind: ImpactMessageKind,
      rows: ImpactMessageUpsertRow[],
      notify = true,
    ) => runBulk(() => messageUpsert[kind](rows), notify),
    upsertMessageTranslations: (
      kind: ImpactMessageKind,
      rows: ImpactMessageTranslationUpsertRow[],
      notify = true,
    ) => runBulk(() => messageTrUpsert[kind](rows), notify),
    removeMessage: (kind: ImpactMessageKind, id: number) =>
      runDelete(() => messageDeleteMap[kind]({ variables: { id } })),
    removeMessageTranslation: (kind: ImpactMessageKind, id: number) =>
      runDelete(() => messageTrDeleteMap[kind]({ variables: { id } })),
  };
}
