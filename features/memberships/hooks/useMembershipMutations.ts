"use client";

import { useMutation } from "@apollo/client/react";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { BackendLanguage } from "@/utils/language";
import { membershipOps } from "../registry";
import type {
  CreateMembershipInput,
  MembershipKind,
  UpdateMembershipInput,
} from "../types";

export function useMembershipMutations(kind: MembershipKind) {
  const toast = useToast();
  const language = useGqlLanguage();
  const { t } = useTranslation("memberships");
  const ops = membershipOps[kind];

  const [createM, c1] = useMutation(ops.create);
  const [updateM, c2] = useMutation(ops.update);
  const [removeM, c3] = useMutation(ops.remove);
  const [upsertTrM, c4] = useMutation(ops.upsertTranslation);
  const [deleteTrM, c5] = useMutation(ops.deleteTranslation);
  const [upsertPrM, c6] = useMutation(ops.upsertPricing);
  const [deletePrM, c7] = useMutation(ops.deletePricing);

  const run = async (action: () => Promise<unknown>, successKey: string) => {
    try {
      await action();
      toast.success(t(successKey));
      return true;
    } catch {
      toast.error(t("feedback.error"));
      return false;
    }
  };

  return {
    create: (input: CreateMembershipInput) =>
      run(() => createM({ variables: { input, language } }), "feedback.created"),
    update: (id: number, input: UpdateMembershipInput) =>
      run(() => updateM({ variables: { id, input, language } }), "feedback.updated"),
    remove: (id: number) =>
      run(() => removeM({ variables: { id, language } }), "feedback.deleted"),

    upsertTranslation: (
      id: number,
      data: { language: BackendLanguage; name: string; description: string[] },
    ) =>
      run(
        () =>
          upsertTrM({
            variables: {
              input: {
                [ops.idField]: id,
                language: data.language,
                name: data.name,
                description: data.description,
              },
              language,
            },
          }),
        "feedback.updated",
      ),
    deleteTranslation: (id: number, translationLanguage: BackendLanguage) =>
      run(
        () => deleteTrM({ variables: { id, translationLanguage, language } }),
        "feedback.deleted",
      ),

    upsertPricing: (
      id: number,
      data: { countryId: number; currency: string; price: number; isActive: boolean },
    ) =>
      run(
        () =>
          upsertPrM({
            variables: {
              input: {
                [ops.idField]: id,
                countryId: data.countryId,
                currency: data.currency,
                price: data.price,
                isActive: data.isActive,
              },
              language,
            },
          }),
        "feedback.updated",
      ),
    deletePricing: (id: number, countryId: number) =>
      run(
        () => deletePrM({ variables: { id, countryId, language } }),
        "feedback.deleted",
      ),

    loading:
      c1.loading ||
      c2.loading ||
      c3.loading ||
      c4.loading ||
      c5.loading ||
      c6.loading ||
      c7.loading,
  };
}
