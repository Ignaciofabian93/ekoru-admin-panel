import { gql } from "@apollo/client";

// Admin writes over Advertisement. The bulk mutation backs both the row-edit
// form (a one-row array) and the XLSX import (many rows).

export const BULK_UPSERT_ADVERTISEMENTS = gql`
  mutation BulkUpsertAdvertisements($rows: [AdvertisementUpsertRowInput!]!) {
    bulkUpsertAdvertisements(rows: $rows) {
      created
      createdIds
      updated
      failed
      errors {
        index
        id
        message
      }
    }
  }
`;

export const DELETE_ADVERTISEMENT = gql`
  mutation DeleteAdvertisement($id: Int!) {
    deleteAdvertisement(id: $id)
  }
`;
