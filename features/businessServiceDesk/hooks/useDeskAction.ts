"use client";

import { useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import type { DocumentNode } from "graphql";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { NAMESPACE } from "../i18n";

/**
 * Runs one of the desk's mutations, shows its success or the server's
 * refusal (ekoru-services words it), and reports success so the tab can
 * refetch. `busy` names the row being changed.
 */
export function useDeskAction() {
  const client = useApolloClient();
  const toast = useToast();
  const { t } = useTranslation(NAMESPACE);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (
    rowId: string,
    mutation: DocumentNode,
    variables: Record<string, unknown>,
    successKey: string,
  ): Promise<boolean> => {
    setBusy(rowId);
    try {
      await client.mutate({ mutation, variables });
      toast.success(t(successKey));
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error && error.message ? error.message : t("feedback.error"),
      );
      return false;
    } finally {
      setBusy(null);
    }
  };

  return { run, busy };
}
