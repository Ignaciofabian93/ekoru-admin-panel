import { gql } from "@apollo/client";

// Admin writes for notification templates + their translations. Bulk mutations
// are shared by the row-edit form (a one-row array) and the XLSX import (many
// rows): rows with an id update, rows without create; translations without an
// id are matched by (notificationTemplateId, language). Row failures come back
// in errors[] without aborting the batch.

const BULK_RESULT = `
  created
  createdIds
  updated
  failed
  errors { index id message }
`;

export const BULK_UPSERT_NOTIFICATION_TEMPLATES = gql`
  mutation BulkUpsertNotificationTemplates($rows: [NotificationTemplateUpsertRowInput!]!) {
    bulkUpsertNotificationTemplates(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_NOTIFICATION_TEMPLATE = gql`
  mutation DeleteNotificationTemplate($id: Int!) {
    deleteNotificationTemplate(id: $id) {
      id
    }
  }
`;

export const BULK_UPSERT_NOTIFICATION_TEMPLATE_TRANSLATIONS = gql`
  mutation BulkUpsertNotificationTemplateTranslations(
    $rows: [NotificationTemplateTranslationUpsertRowInput!]!
  ) {
    bulkUpsertNotificationTemplateTranslations(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_NOTIFICATION_TEMPLATE_TRANSLATION = gql`
  mutation DeleteNotificationTemplateTranslation(
    $notificationTemplateId: Int!
    $translationLanguage: Language!
  ) {
    deleteNotificationTemplateTranslation(
      notificationTemplateId: $notificationTemplateId
      translationLanguage: $translationLanguage
    ) {
      id
    }
  }
`;
