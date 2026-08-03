import { gql } from "@apollo/client";

// Admin-only raw reads over the ekoru-search config tables (AdminSearchResolver).
// Flat, single-language config rows exactly as stored (inactive included) — the
// source for the CRUD screens and the XLSX export.

const PAGE_INFO = gql`
  fragment SearchAdminPageInfoFields on SearchAdminPageInfo {
    currentPage
    totalPages
    totalCount
    hasNextPage
    hasPreviousPage
    pageSize
  }
`;

export const GET_RAW_SEARCH_SYNONYMS = gql`
  ${PAGE_INFO}
  query RawSearchSynonyms(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $isActive: Boolean
  ) {
    rawSearchSynonyms(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      isActive: $isActive
    ) {
      nodes {
        id
        term
        synonym
        weight
        isActive
        createdAt
        updatedAt
      }
      pageInfo {
        ...SearchAdminPageInfoFields
      }
    }
  }
`;

export const GET_RAW_SEARCH_CORRECTIONS = gql`
  ${PAGE_INFO}
  query RawSearchCorrections(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $isActive: Boolean
  ) {
    rawSearchCorrections(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      isActive: $isActive
    ) {
      nodes {
        id
        incorrectTerm
        correctTerm
        frequency
        confidence
        isActive
        createdAt
        updatedAt
      }
      pageInfo {
        ...SearchAdminPageInfoFields
      }
    }
  }
`;

export const GET_RAW_SEARCH_SUGGESTIONS = gql`
  ${PAGE_INFO}
  query RawSearchSuggestions(
    $id: Int
    $page: Int
    $pageSize: Int
    $search: String
    $isActive: Boolean
  ) {
    rawSearchSuggestions(
      id: $id
      page: $page
      pageSize: $pageSize
      search: $search
      isActive: $isActive
    ) {
      nodes {
        id
        term
        frequency
        isActive
        createdAt
        updatedAt
      }
      pageInfo {
        ...SearchAdminPageInfoFields
      }
    }
  }
`;
