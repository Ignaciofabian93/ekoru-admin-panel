"use client";

import { useMutation } from "@apollo/client/react";
import {
  CREATE_SELLER_LABEL,
  DELETE_SELLER_LABEL,
  DELETE_SELLER_LABEL_TRANSLATION,
  UPDATE_SELLER_LABEL,
  UPSERT_SELLER_LABEL_TRANSLATION,
} from "@/graphql/seller-labels/mutations";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { BackendLanguage } from "@/utils/language";
import type {
  CreateSellerLabelInput,
  UpdateSellerLabelInput,
  UpsertSellerLabelTranslationInput,
} from "../types";

export function useSellerLabelMutations() {
  const toast = useToast();
  const language = useGqlLanguage();
  const { t } = useTranslation("sellerLabels");

  const [createM, c1] = useMutation(CREATE_SELLER_LABEL);
  const [updateM, c2] = useMutation(UPDATE_SELLER_LABEL);
  const [deleteM, c3] = useMutation(DELETE_SELLER_LABEL);
  const [upsertTrM, c4] = useMutation(UPSERT_SELLER_LABEL_TRANSLATION);
  const [deleteTrM, c5] = useMutation(DELETE_SELLER_LABEL_TRANSLATION);

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
    createLabel: (input: CreateSellerLabelInput) =>
      run(() => createM({ variables: { input, language } }), "feedback.created"),
    updateLabel: (id: number, input: UpdateSellerLabelInput) =>
      run(() => updateM({ variables: { id, input, language } }), "feedback.updated"),
    deleteLabel: (id: number) =>
      run(() => deleteM({ variables: { id, language } }), "feedback.deleted"),
    upsertTranslation: (input: UpsertSellerLabelTranslationInput) =>
      run(() => upsertTrM({ variables: { input, language } }), "feedback.updated"),
    deleteTranslation: (sellerLabelId: number, translationLanguage: BackendLanguage) =>
      run(
        () => deleteTrM({ variables: { sellerLabelId, translationLanguage, language } }),
        "feedback.deleted",
      ),
    loading: c1.loading || c2.loading || c3.loading || c4.loading || c5.loading,
  };
}
