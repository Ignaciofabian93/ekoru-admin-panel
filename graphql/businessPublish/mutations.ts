import { gql } from "@apollo/client";

// A business's own catalog from the spreadsheet (ADM-16). At most 200 rows per
// call; the panel sends them in chunks.
export const PUBLISH_MY_STORE_PRODUCTS = gql`
  mutation PublishMyStoreProducts(
    $rows: [BusinessStoreProductRowInput!]!
    $language: Language
  ) {
    publishMyStoreProducts(rows: $rows, language: $language) {
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

export const PUBLISH_MY_SERVICES = gql`
  mutation PublishMyServices($rows: [BusinessServiceRowInput!]!, $language: Language) {
    publishMyServices(rows: $rows, language: $language) {
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
