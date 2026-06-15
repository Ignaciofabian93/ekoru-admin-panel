"use client";

import { useMutation } from "@apollo/client/react";
import { BAN_SELLER, REINSTATE_SELLER, VERIFY_SELLER } from "@/graphql/sellers/mutations";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { BanReason } from "@/types/enums";
import type { Seller } from "@/types/user";

export type BanSellerInput = {
  reasonCode: BanReason;
  reason: string;
  notes?: string;
};

/**
 * Status/lifecycle mutations a PLATFORM admin can run on a seller, mapped to the
 * `ekoru-users` SellersResolver:
 *   - {@link verify}    → `verifySeller` (toggle, MANAGE_USERS)
 *   - {@link ban}       → `banSeller`    (deactivate + unverify, BAN_USERS)
 *   - {@link reinstate} → `reinstateSeller` (lift ban, BAN_USERS)
 *
 * Each surfaces a toast and resolves to the updated Seller (or null on failure)
 * so the caller can refresh the affected record in place.
 */
export function useSellerMutations() {
  const toast = useToast();
  const language = useGqlLanguage();
  const { t } = useTranslation("users");

  const [verifyMutation, { loading: verifyLoading }] = useMutation<{
    verifySeller: Seller;
  }>(VERIFY_SELLER);
  const [banMutation, { loading: banLoading }] = useMutation<{ banSeller: Seller }>(
    BAN_SELLER,
  );
  const [reinstateMutation, { loading: reinstateLoading }] = useMutation<{
    reinstateSeller: Seller;
  }>(REINSTATE_SELLER);

  const verify = async (id: string): Promise<Seller | null> => {
    try {
      const { data } = await verifyMutation({ variables: { id, language } });
      toast.success(t("feedback.updated"));
      return data?.verifySeller ?? null;
    } catch {
      toast.error(t("feedback.error"));
      return null;
    }
  };

  const ban = async (id: string, input: BanSellerInput): Promise<Seller | null> => {
    try {
      const { data } = await banMutation({ variables: { id, input, language } });
      toast.success(t("feedback.banned"));
      return data?.banSeller ?? null;
    } catch {
      toast.error(t("feedback.error"));
      return null;
    }
  };

  const reinstate = async (id: string, unbanReason?: string): Promise<Seller | null> => {
    try {
      const { data } = await reinstateMutation({
        variables: { id, language, unbanReason: unbanReason || undefined },
      });
      toast.success(t("feedback.activated"));
      return data?.reinstateSeller ?? null;
    } catch {
      toast.error(t("feedback.error"));
      return null;
    }
  };

  return {
    verify,
    ban,
    reinstate,
    loading: verifyLoading || banLoading || reinstateLoading,
  };
}
