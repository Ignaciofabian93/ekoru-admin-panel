"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_BUSINESS_PLAN_RULE } from "@/graphql/memberships/mutations";
import { BUSINESS_PLAN_RULES } from "@/graphql/memberships/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { BusinessSubscriptionPlan } from "@/types/enums";

export type BusinessPlanRule = {
  plan: BusinessSubscriptionPlan;
  /** Admin accounts the business may have in the panel; 0 = no panel. */
  panelSeats: number;
};

/** What each business plan includes besides its price (USR-15). */
export function useBusinessPlanRules() {
  const toast = useToast();
  const language = useGqlLanguage();
  const { t } = useTranslation("memberships");

  const { data, loading } = useQuery<{ businessPlanRules: BusinessPlanRule[] }>(
    BUSINESS_PLAN_RULES,
    { fetchPolicy: "cache-and-network" },
  );
  const [updateM, { loading: saving }] = useMutation(UPDATE_BUSINESS_PLAN_RULE, {
    refetchQueries: [{ query: BUSINESS_PLAN_RULES }],
  });

  const update = async (plan: BusinessSubscriptionPlan, panelSeats: number) => {
    try {
      await updateM({ variables: { plan, panelSeats, language } });
      toast.success(t("rules.saved"));
      return true;
    } catch (error) {
      // The server says why, e.g. a number out of range.
      const message = error instanceof Error ? error.message : "";
      toast.error(message || t("feedback.error"));
      return false;
    }
  };

  return { rules: data?.businessPlanRules ?? [], loading, saving, update };
}
