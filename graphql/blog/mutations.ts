import { gql } from "@apollo/client";

// Admin-only writes over blog posts. All require a platform admin (adminId from
// the x-admin-id header the gateway sets). Mirrors BlogPostResolver.

export const CREATE_BLOG_POST = gql`
  mutation CreateBlogPost($input: CreateBlogPostInput!) {
    createBlogPost(input: $input) {
      id
    }
  }
`;

export const UPDATE_BLOG_POST = gql`
  mutation UpdateBlogPost($id: Int!, $input: UpdateBlogPostInput!) {
    updateBlogPost(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_BLOG_POST = gql`
  mutation DeleteBlogPost($id: Int!) {
    deleteBlogPost(id: $id)
  }
`;

export const UPSERT_BLOG_POST_TRANSLATION = gql`
  mutation UpsertBlogPostTranslation($input: UpsertBlogPostTranslationInput!) {
    upsertBlogPostTranslation(input: $input) {
      id
    }
  }
`;

export const DELETE_BLOG_POST_TRANSLATION = gql`
  mutation DeleteBlogPostTranslation($blogPostId: Int!, $language: Language!) {
    deleteBlogPostTranslation(blogPostId: $blogPostId, language: $language)
  }
`;
