import { gql } from "@apollo/client";

// Admin writes over Service + its media / FAQ (ekoru-services AdminServicesResolver).
// Bulk mutations back both the row-edit forms (a one-row array) and the XLSX
// import (many rows): rows with an id update, rows without create. Row failures
// come back in errors[] without aborting the batch.

const BULK_RESULT = `
  created
  createdIds
  updated
  failed
  errors { index id message }
`;

export const BULK_UPSERT_SERVICES = gql`
  mutation BulkUpsertServices($rows: [ServiceUpsertRowInput!]!) {
    bulkUpsertServices(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_SERVICE = gql`
  mutation DeleteService($id: Int!) {
    deleteService(id: $id)
  }
`;

export const BULK_UPSERT_SERVICE_MEDIA = gql`
  mutation BulkUpsertServiceMedia($rows: [ServiceMediaUpsertRowInput!]!) {
    bulkUpsertServiceMedia(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_SERVICE_MEDIA = gql`
  mutation DeleteServiceMedia($id: Int!) {
    deleteServiceMedia(id: $id)
  }
`;

export const BULK_UPSERT_SERVICE_FAQS = gql`
  mutation BulkUpsertServiceFaqs($rows: [ServiceFaqUpsertRowInput!]!) {
    bulkUpsertServiceFaqs(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_SERVICE_FAQ = gql`
  mutation DeleteServiceFaq($id: Int!) {
    deleteServiceFaq(id: $id)
  }
`;
