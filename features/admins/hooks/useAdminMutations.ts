"use client";

import { useMutation } from "@apollo/client/react";
import {
  ASSIGN_PERMISSIONS,
  CREATE_ADMIN,
  DELETE_ADMIN,
  TOGGLE_ADMIN_STATUS,
  UPDATE_ADMIN,
} from "@/graphql/admins/mutations";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { AdminPermission } from "@/types/enums";
import type { RegisterAdminInput, UpdateAdminInput } from "../types";

/** Create / update / lifecycle / permission mutations for admins. */
export function useAdminMutations() {
  const toast = useToast();
  const language = useGqlLanguage();
  const { t } = useTranslation("admins");

  const [createMutation, { loading: creating }] = useMutation(CREATE_ADMIN);
  const [updateMutation, { loading: updating }] = useMutation(UPDATE_ADMIN);
  const [deleteMutation, { loading: deleting }] = useMutation(DELETE_ADMIN);
  const [toggleMutation, { loading: toggling }] = useMutation(TOGGLE_ADMIN_STATUS);
  const [permsMutation, { loading: assigning }] = useMutation(ASSIGN_PERMISSIONS);

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
    createAdmin: (input: RegisterAdminInput) =>
      run(() => createMutation({ variables: { input, language } }), "feedback.created"),
    updateAdmin: (id: string, input: UpdateAdminInput) =>
      run(
        () => updateMutation({ variables: { id, input, language } }),
        "feedback.updated",
      ),
    removeAdmin: (id: string) =>
      run(() => deleteMutation({ variables: { id, language } }), "feedback.deleted"),
    toggleStatus: (id: string, isActive: boolean) =>
      run(
        () => toggleMutation({ variables: { id, isActive, language } }),
        "feedback.updated",
      ),
    assignPermissions: (id: string, permissions: AdminPermission[]) =>
      run(
        () => permsMutation({ variables: { id, permissions, language } }),
        "feedback.updated",
      ),
    loading: creating || updating || deleting || toggling || assigning,
  };
}
