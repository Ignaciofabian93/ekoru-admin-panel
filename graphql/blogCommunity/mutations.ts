import { gql } from "@apollo/client";

// Admin-only writes over the blog & community category tables. Every bulk
// mutation shares the same contract: rows with an id update, rows without an id
// create (translations without id are matched by their parent+language unique
// key). A single-row array is the row-by-row edit path of the panel; the same
// mutation absorbs a whole spreadsheet on import. Row failures are reported in
// `errors[]` without aborting the rest of the batch.

const BULK_RESULT = gql`
  fragment BlogCommunityBulkResult on BlogCommunityBulkUpsertResult {
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
`;

// ─── Blog categories ──────────────────────────────────────────────────────────

export const BULK_UPSERT_BLOG_CATEGORIES = gql`
  ${BULK_RESULT}
  mutation BulkUpsertBlogCategories($rows: [BlogCategoryUpsertRowInput!]!) {
    bulkUpsertBlogCategories(rows: $rows) {
      ...BlogCommunityBulkResult
    }
  }
`;

export const BULK_UPSERT_BLOG_CATEGORY_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertBlogCategoryTranslations(
    $rows: [BlogCategoryTranslationUpsertRowInput!]!
  ) {
    bulkUpsertBlogCategoryTranslations(rows: $rows) {
      ...BlogCommunityBulkResult
    }
  }
`;

export const DELETE_BLOG_CATEGORY = gql`
  mutation DeleteBlogCategory($id: Int!) {
    deleteBlogCategory(id: $id)
  }
`;

export const DELETE_BLOG_CATEGORY_TRANSLATION = gql`
  mutation DeleteBlogCategoryTranslation($id: Int!) {
    deleteBlogCategoryTranslation(id: $id)
  }
`;

// ─── Community categories ─────────────────────────────────────────────────────

export const BULK_UPSERT_COMMUNITY_CATEGORIES = gql`
  ${BULK_RESULT}
  mutation BulkUpsertCommunityCategories($rows: [CommunityCategoryUpsertRowInput!]!) {
    bulkUpsertCommunityCategories(rows: $rows) {
      ...BlogCommunityBulkResult
    }
  }
`;

export const BULK_UPSERT_COMMUNITY_CATEGORY_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertCommunityCategoryTranslations(
    $rows: [CommunityCategoryTranslationUpsertRowInput!]!
  ) {
    bulkUpsertCommunityCategoryTranslations(rows: $rows) {
      ...BlogCommunityBulkResult
    }
  }
`;

export const DELETE_COMMUNITY_CATEGORY = gql`
  mutation DeleteCommunityCategory($id: Int!) {
    deleteCommunityCategory(id: $id)
  }
`;

export const DELETE_COMMUNITY_CATEGORY_TRANSLATION = gql`
  mutation DeleteCommunityCategoryTranslation($id: Int!) {
    deleteCommunityCategoryTranslation(id: $id)
  }
`;

// ─── Community sub categories ─────────────────────────────────────────────────

export const BULK_UPSERT_COMMUNITY_SUB_CATEGORIES = gql`
  ${BULK_RESULT}
  mutation BulkUpsertCommunitySubCategories(
    $rows: [CommunitySubCategoryUpsertRowInput!]!
  ) {
    bulkUpsertCommunitySubCategories(rows: $rows) {
      ...BlogCommunityBulkResult
    }
  }
`;

export const BULK_UPSERT_COMMUNITY_SUB_CATEGORY_TRANSLATIONS = gql`
  ${BULK_RESULT}
  mutation BulkUpsertCommunitySubCategoryTranslations(
    $rows: [CommunitySubCategoryTranslationUpsertRowInput!]!
  ) {
    bulkUpsertCommunitySubCategoryTranslations(rows: $rows) {
      ...BlogCommunityBulkResult
    }
  }
`;

export const DELETE_COMMUNITY_SUB_CATEGORY = gql`
  mutation DeleteCommunitySubCategory($id: Int!) {
    deleteCommunitySubCategory(id: $id)
  }
`;

export const DELETE_COMMUNITY_SUB_CATEGORY_TRANSLATION = gql`
  mutation DeleteCommunitySubCategoryTranslation($id: Int!) {
    deleteCommunitySubCategoryTranslation(id: $id)
  }
`;
