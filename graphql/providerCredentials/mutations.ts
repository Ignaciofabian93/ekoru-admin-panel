import { gql } from "@apollo/client";

// Admin writes over ServiceProviderCredentials. The bulk mutation backs both the
// row-edit form (a one-row array) and the XLSX import (many rows): rows with an
// id update, rows without create (matched on the unique sellerId).

export const BULK_UPSERT_SERVICE_CREDENTIALS = gql`
  mutation BulkUpsertServiceCredentials($rows: [ServiceCredentialsUpsertRowInput!]!) {
    bulkUpsertServiceCredentials(rows: $rows) {
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

export const DELETE_SERVICE_CREDENTIALS = gql`
  mutation DeleteServiceCredentials($id: Int!) {
    deleteServiceCredentials(id: $id)
  }
`;
