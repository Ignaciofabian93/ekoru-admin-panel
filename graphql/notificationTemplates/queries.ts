import { gql } from "@apollo/client";

// Admin reads for notification templates (AccountResolver in ekoru-users). Raw
// reads return every template with all its translations — the source for the
// CRUD screens and the XLSX export.

const TEMPLATE_FIELDS = `
  id
  type
  title
  message
  isActive
  createdAt
  updatedAt
  translations {
    id
    notificationTemplateId
    language
    title
    message
  }
`;

export const GET_NOTIFICATION_TEMPLATES = gql`
  query NotificationTemplates {
    notificationTemplates {${TEMPLATE_FIELDS}}
  }
`;

export const GET_NOTIFICATION_TEMPLATE = gql`
  query NotificationTemplate($id: Int!) {
    notificationTemplate(id: $id) {${TEMPLATE_FIELDS}}
  }
`;
