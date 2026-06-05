"use client";

import { useMutation } from "@apollo/client/react";
import {
  CREATE_SELLER_LEVEL,
  DELETE_SELLER_LEVEL,
  DELETE_SELLER_LEVEL_TRANSLATION,
  UPDATE_SELLER_LEVEL,
  UPSERT_SELLER_LEVEL_TRANSLATION,
} from "@/graphql/seller-levels/mutations";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { BackendLanguage } from "@/utils/language";
import type {
  CreateSellerLevelInput,
  UpdateSellerLevelInput,
  UpsertSellerLevelTranslationInput,
} from "../types";

export function useSellerLevelMutations() {
  const toast = useToast();
  const language = useGqlLanguage();
  const { t } = useTranslation("sellerLevels");

  const [createM, c1] = useMutation(CREATE_SELLER_LEVEL);
  const [updateM, c2] = useMutation(UPDATE_SELLER_LEVEL);
  const [deleteM, c3] = useMutation(DELETE_SELLER_LEVEL);
  const [upsertTrM, c4] = useMutation(UPSERT_SELLER_LEVEL_TRANSLATION);
  const [deleteTrM, c5] = useMutation(DELETE_SELLER_LEVEL_TRANSLATION);

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
    createLevel: (input: CreateSellerLevelInput) =>
      run(() => createM({ variables: { input, language } }), "feedback.created"),
    updateLevel: (id: number, input: UpdateSellerLevelInput) =>
      run(() => updateM({ variables: { id, input, language } }), "feedback.updated"),
    deleteLevel: (id: number) =>
      run(() => deleteM({ variables: { id, language } }), "feedback.deleted"),
    upsertTranslation: (input: UpsertSellerLevelTranslationInput) =>
      run(() => upsertTrM({ variables: { input, language } }), "feedback.updated"),
    deleteTranslation: (sellerLevelId: number, translationLanguage: BackendLanguage) =>
      run(
        () => deleteTrM({ variables: { sellerLevelId, translationLanguage, language } }),
        "feedback.deleted",
      ),
    loading: c1.loading || c2.loading || c3.loading || c4.loading || c5.loading,
  };
}
