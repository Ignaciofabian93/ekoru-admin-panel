import type { BackendLanguage } from "@/utils/language";

/** One template's per-language override of title + message. */
export type NotificationTemplateTranslation = {
  id: number;
  notificationTemplateId: number;
  language: BackendLanguage;
  title: string;
  message: string;
};

/** A notification template — default title/message for a notification type. */
export type NotificationTemplate = {
  id: number;
  type: string;
  title: string;
  message: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  translations?: NotificationTemplateTranslation[];
};

export type NotificationTemplatesResult = {
  notificationTemplates: NotificationTemplate[];
};
export type NotificationTemplateResult = {
  notificationTemplate: NotificationTemplate | null;
};

export type NotificationTemplateUpsertRow = {
  id?: number;
  type?: string;
  title?: string;
  message?: string;
  isActive?: boolean;
};

export type NotificationTemplateTranslationUpsertRow = {
  id?: number;
  notificationTemplateId?: number;
  language?: BackendLanguage;
  title?: string;
  message?: string;
};

export type BulkUpsertResult = {
  created: number;
  createdIds: number[];
  updated: number;
  failed: number;
  errors: { index: number; id: number | null; message: string }[];
};

/**
 * The NotificationType enum, kept in sync with the ekoru-users Prisma enum.
 * Used to populate the `type` dropdown on the create form.
 */
export const NOTIFICATION_TYPES = [
  "ORDER_RECEIVED",
  "ORDER_CONFIRMED",
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
  "ORDER_CANCELLED",
  "QUOTATION_REQUEST",
  "QUOTATION_RECEIVED",
  "QUOTATION_ACCEPTED",
  "QUOTATION_DECLINED",
  "EXCHANGE_PROPOSAL",
  "EXCHANGE_ACCEPTED",
  "EXCHANGE_DECLINED",
  "EXCHANGE_COMPLETED",
  "PAYMENT_RECEIVED",
  "PAYMENT_FAILED",
  "PAYMENT_REFUNDED",
  "REVIEW_RECEIVED",
  "MESSAGE_RECEIVED",
  "PRODUCT_LIKED",
  "PRODUCT_COMMENTED",
  "SYSTEM_ANNOUNCEMENT",
  "ACCOUNT_VERIFICATION",
  "PROFILE_UPDATED",
] as const;
