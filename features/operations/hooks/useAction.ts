"use client";

import { useMutation } from "@apollo/client/react";
import type { DocumentNode } from "graphql";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";

/**
 * One operator action (refund, resolve, cancel, ship): runs the mutation,
 * shows the success message or the server's refusal, and reports success so
 * the screen can refetch.
 */
export function useAction(document: DocumentNode) {
  const toast = useToast();
  const { t } = useTranslation("operations");
  const { t: tc } = useTranslation();
  const [mutate, { loading }] = useMutation(document);

  const run = async (
    variables: Record<string, unknown>,
    successKey: string,
  ): Promise<boolean> => {
    try {
      await mutate({ variables });
      toast.success(t(successKey));
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error && error.message ? error.message : tc("common.error"),
      );
      return false;
    }
  };

  return { run, loading };
}
