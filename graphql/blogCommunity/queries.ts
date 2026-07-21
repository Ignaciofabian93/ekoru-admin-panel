import { gql } from "@apollo/client";

// Admin-only raw reads over the blog & community category tables
// (ekoru-blog-community AdminCatalogResolver). Rows come back exactly as
// stored: every translation, inactive rows included — the source of truth for
// the CRUD screens and the XLSX export.
//
// The translation "name" column is spelled differently per table in the DB
// (`name` for blog, `category` for community, `subCategory` for community sub),
// so the community queries alias it to `name` — the panel treats them uniformly.

const PAGE_INFO = gql`
  fragment BlogCommunityCatalogPageInfo on BlogCommunityPageInfo {
    currentPage
    totalPages
    totalCount
    hasNextPage
    hasPreviousPage
    pageSize
  }
`;

export const GET_RAW_BLOG_CATEGORIES = gql`
  ${PAGE_INFO}
  query RawBlogCategories($id: Int, $page: Int, $pageSize: Int, $search: String) {
    rawBlogCategories(id: $id, page: $page, pageSize: $pageSize, search: $search) {
      nodes {
        id
        icon
        isActive
        sortOrder
        featuredFrom
        featuredUntil
        createdAt
        updatedAt
        translations {
          id
          blogCategoryId
          language
          name
          slug
          description
          href
          metaTitle
          metaDescription
          metaKeywords
        }
      }
      pageInfo {
        ...BlogCommunityCatalogPageInfo
      }
    }
  }
`;

export const GET_RAW_COMMUNITY_CATEGORIES = gql`
  ${PAGE_INFO}
  query RawCommunityCategories($id: Int, $page: Int, $pageSize: Int, $search: String) {
    rawCommunityCategories(id: $id, page: $page, pageSize: $pageSize, search: $search) {
      nodes {
        id
        isActive
        sortOrder
        featuredFrom
        featuredUntil
        createdAt
        updatedAt
        translations {
          id
          communityCategoryId
          language
          name: category
          slug
          description
          href
          metaTitle
          metaDescription
          metaKeywords
        }
      }
      pageInfo {
        ...BlogCommunityCatalogPageInfo
      }
    }
  }
`;

export const GET_RAW_COMMUNITY_SUB_CATEGORIES = gql`
  ${PAGE_INFO}
  query RawCommunitySubCategories(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $communityCategoryId: Int
  ) {
    rawCommunitySubCategories(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      communityCategoryId: $communityCategoryId
    ) {
      nodes {
        id
        communityCategoryId
        isActive
        sortOrder
        featuredFrom
        featuredUntil
        createdAt
        updatedAt
        translations {
          id
          communitySubCategoryId
          language
          name: subCategory
          slug
          description
          href
          metaTitle
          metaDescription
          metaKeywords
        }
      }
      pageInfo {
        ...BlogCommunityCatalogPageInfo
      }
    }
  }
`;
