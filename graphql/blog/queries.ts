import { gql } from "@apollo/client";

// Admin-only reads over blog posts (ekoru-blog-community BlogPostResolver).
// Rows come back exactly as stored: every translation, unpublished included.

const BLOG_POST_FIELDS = gql`
  fragment AdminBlogPostFields on AdminBlogPost {
    id
    authorId
    blogCategoryId
    type
    coverImage
    isPublished
    publishedAt
    likes
    dislikes
    createdAt
    updatedAt
    translations {
      id
      blogPostId
      language
      title
      slug
      content
      excerpt
      metaTitle
      metaDescription
      metaKeywords
    }
  }
`;

export const ADMIN_BLOG_POSTS = gql`
  ${BLOG_POST_FIELDS}
  query AdminBlogPosts($page: Int, $pageSize: Int, $search: String) {
    adminBlogPosts(page: $page, pageSize: $pageSize, search: $search) {
      nodes {
        ...AdminBlogPostFields
      }
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
        pageSize
      }
    }
  }
`;

export const ADMIN_BLOG_POST = gql`
  ${BLOG_POST_FIELDS}
  query AdminBlogPost($id: Int!) {
    adminBlogPost(id: $id) {
      ...AdminBlogPostFields
    }
  }
`;

// Category options for the blog-post form select (existing catalog read).
export const BLOG_CATEGORY_OPTIONS = gql`
  query BlogCategoryOptions($language: Language) {
    getBlogCategoryList(limit: 100, offset: 0, language: $language) {
      id
      translation {
        name
      }
    }
  }
`;
