import { gql } from "@apollo/client";

const VERSION = `
  id
  version
  summary
  publishedAt
  isCurrent
  acceptanceCount
  createdAt
  updatedAt
  translations {
    id
    language
    title
    content
  }
`;

/** Every Terms and Policies version, newest first (LEG-1, MANAGE_SETTINGS). */
export const TERMS_VERSIONS = gql`
  query TermsVersions {
    termsVersions {
      ${VERSION}
    }
  }
`;

export const SAVE_TERMS_DRAFT = gql`
  mutation SaveTermsDraft($input: SaveTermsDraftInput!, $language: Language) {
    saveTermsDraft(input: $input, language: $language) {
      ${VERSION}
    }
  }
`;

export const PUBLISH_TERMS_VERSION = gql`
  mutation PublishTermsVersion($id: Int!, $language: Language) {
    publishTermsVersion(id: $id, language: $language) {
      ${VERSION}
    }
  }
`;

export const DELETE_TERMS_DRAFT = gql`
  mutation DeleteTermsDraft($id: Int!, $language: Language) {
    deleteTermsDraft(id: $id, language: $language)
  }
`;
