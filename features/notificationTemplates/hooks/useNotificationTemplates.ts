"use client";

import { useQuery } from "@apollo/client/react";
import {
  GET_NOTIFICATION_TEMPLATES,
  GET_NOTIFICATION_TEMPLATE,
} from "@/graphql/notificationTemplates/queries";
import type { NotificationTemplateResult, NotificationTemplatesResult } from "../types";

/** All notification templates with their translations (inactive included). */
export function useNotificationTemplates() {
  const { data, loading, error, refetch } = useQuery<NotificationTemplatesResult>(
    GET_NOTIFICATION_TEMPLATES,
    {
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    templates: data?.notificationTemplates ?? [],
    loading,
    error,
    refetch,
  };
}

/** Single template for the edit screen. */
export function useNotificationTemplate(id?: number) {
  const { data, loading, error, refetch } = useQuery<NotificationTemplateResult>(
    GET_NOTIFICATION_TEMPLATE,
    {
      variables: id != null ? { id } : undefined,
      skip: id == null,
      notifyOnNetworkStatusChange: true,
    },
  );
  return {
    template: data?.notificationTemplate ?? null,
    loading,
    error,
    refetch,
  };
}
