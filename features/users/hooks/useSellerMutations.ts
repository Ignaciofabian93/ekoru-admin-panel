"use client";

import { useMutation } from "@apollo/client/react";
import {
  DELETE_SELLER,
  SET_SELLER_ACTIVE,
  SET_SELLER_VERIFIED,
} from "@/graphql/sellers/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";

/**
 * Status/lifecycle mutations a PLATFORM admin can run on a seller. Each call
 * surfaces a toast and lets the caller refetch the affected record.
 */
export function useSellerMutations() {
  const toast = useToast();
  const { t } = useTranslation("users");

  const [setActiveMutation, { loading: activeLoading }] = useMutation(SET_SELLER_ACTIVE);
  const [setVerifiedMutation, { loading: verifyLoading }] =
    useMutation(SET_SELLER_VERIFIED);
  const [deleteMutation, { loading: deleteLoading }] = useMutation(DELETE_SELLER);

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

  const setActive = (id: string, isActive: boolean) =>
    run(() => setActiveMutation({ variables: { id, isActive } }), "feedback.updated");

  const setVerified = (id: string, isVerified: boolean) =>
    run(() => setVerifiedMutation({ variables: { id, isVerified } }), "feedback.updated");

  const removeSeller = (id: string) =>
    run(() => deleteMutation({ variables: { id } }), "feedback.deleted");

  return {
    setActive,
    setVerified,
    removeSeller,
    loading: activeLoading || verifyLoading || deleteLoading,
  };
}
