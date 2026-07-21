"use client";

import { useMutation } from "@apollo/client/react";
import {
  CREATE_COMMUNITY_EVENT,
  UPDATE_COMMUNITY_EVENT,
  DELETE_COMMUNITY_EVENT,
  DELETE_COMMUNITY_REGISTRATION,
} from "@/graphql/community/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { CreateCommunityEventInput, UpdateCommunityEventInput } from "../types";

/**
 * Create / update / delete community events plus registration removal. Each
 * call toasts success/failure and returns a boolean (or the new id for create)
 * so screens can navigate. Errors surface the backend message when present.
 */
export function useCommunityEventMutations() {
  const toast = useToast();
  const { t } = useTranslation("communityEvents");
  const { t: tc } = useTranslation();

  const [createM, c1] = useMutation<{ createCommunityEvent: { id: number } }>(
    CREATE_COMMUNITY_EVENT,
  );
  const [updateM, c2] = useMutation(UPDATE_COMMUNITY_EVENT);
  const [deleteM, c3] = useMutation(DELETE_COMMUNITY_EVENT);
  const [deleteRegM, c4] = useMutation(DELETE_COMMUNITY_REGISTRATION);

  const loading = c1.loading || c2.loading || c3.loading || c4.loading;

  const fail = (error: unknown) => {
    const message = error instanceof Error ? error.message : "";
    toast.error(message || tc("common.error"));
  };

  const createEvent = async (
    input: CreateCommunityEventInput,
  ): Promise<number | null> => {
    try {
      const { data } = await createM({ variables: { input } });
      toast.success(t("feedback.created"));
      return data?.createCommunityEvent.id ?? null;
    } catch (error) {
      fail(error);
      return null;
    }
  };

  const updateEvent = async (
    id: number,
    input: UpdateCommunityEventInput,
  ): Promise<boolean> => {
    try {
      await updateM({ variables: { id, input } });
      toast.success(t("feedback.saved"));
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  const deleteEvent = async (id: number): Promise<boolean> => {
    try {
      await deleteM({ variables: { id } });
      toast.success(t("feedback.deleted"));
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  const deleteRegistration = async (id: number): Promise<boolean> => {
    try {
      await deleteRegM({ variables: { id } });
      toast.success(t("feedback.registrationRemoved"));
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  return {
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    deleteRegistration,
  };
}
