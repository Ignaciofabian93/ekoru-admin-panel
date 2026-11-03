"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  INVITE_BUSINESS_ADMIN,
  RESEND_BUSINESS_ADMIN_INVITE,
  SET_BUSINESS_ADMIN_ACTIVE,
  UPDATE_BUSINESS_ADMIN,
} from "@/graphql/businessTeam/mutations";
import { MY_BUSINESS_TEAM } from "@/graphql/businessTeam/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { NAMESPACE } from "../i18n";
import type { BusinessTeam, MemberDraft } from "../types";

/**
 * The signed-in business's panel accounts (USR-15). Every change refetches the
 * team, so the seat count and who holds a seat stay as the server sees them.
 * Errors come back worded by the server (no free account, not your team…).
 */
export function useBusinessTeam() {
  const toast = useToast();
  const language = useGqlLanguage();
  const { t } = useTranslation(NAMESPACE);

  const { data, loading } = useQuery<{ myBusinessTeam: BusinessTeam }>(MY_BUSINESS_TEAM, {
    variables: { language },
    fetchPolicy: "cache-and-network",
  });
  const refetchQueries = [{ query: MY_BUSINESS_TEAM, variables: { language } }];
  const [inviteM, invite] = useMutation(INVITE_BUSINESS_ADMIN, { refetchQueries });
  const [updateM, update] = useMutation(UPDATE_BUSINESS_ADMIN, { refetchQueries });
  const [activeM, active] = useMutation(SET_BUSINESS_ADMIN_ACTIVE, { refetchQueries });
  const [resendM, resend] = useMutation(RESEND_BUSINESS_ADMIN_INVITE);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast.success(success);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("feedback.error"));
      return false;
    }
  };

  return {
    team: data?.myBusinessTeam ?? null,
    loading: loading && !data,
    saving: invite.loading || update.loading || active.loading || resend.loading,
    inviteMember: (draft: MemberDraft) =>
      run(
        () =>
          inviteM({
            variables: {
              language,
              input: {
                email: draft.email.trim().toLowerCase(),
                name: draft.name.trim(),
                lastName: draft.lastName.trim() || null,
                role: draft.role,
                permissions: draft.permissions,
              },
            },
          }),
        t("feedback.invited", { email: draft.email.trim().toLowerCase() }),
      ),
    updateMember: (id: string, draft: MemberDraft) =>
      run(
        () =>
          updateM({
            variables: {
              id,
              language,
              input: {
                name: draft.name.trim(),
                lastName: draft.lastName.trim(),
                role: draft.role,
                permissions: draft.permissions,
              },
            },
          }),
        t("feedback.saved"),
      ),
    setActive: (id: string, isActive: boolean) =>
      run(
        () => activeM({ variables: { id, isActive, language } }),
        t(isActive ? "feedback.turnedOn" : "feedback.turnedOff"),
      ),
    resendInvite: (id: string, email: string) =>
      run(
        () => resendM({ variables: { id, language } }),
        t("feedback.invited", { email }),
      ),
  };
}
