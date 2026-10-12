import { gql } from "@apollo/client";

/**
 * Dashboard counts (ADM-3). One query per number, so a permission the admin
 * lacks only skips its own card. Each asks for one row; only `totalCount`
 * matters.
 */

export const PENDING_BUSINESSES = gql`
  query DashboardPendingBusinesses {
    getSellers(language: ES, page: 1, pageSize: 1, approvalStatus: PENDING) {
      pageInfo {
        totalCount
      }
    }
  }
`;

export const NEW_SELLERS = gql`
  query DashboardNewSellers($since: DateTime!) {
    getSellers(language: ES, page: 1, pageSize: 1, createdAfter: $since) {
      pageInfo {
        totalCount
      }
    }
  }
`;

export const ORDERS_SINCE = gql`
  query DashboardOrders($since: DateTime!) {
    adminOrders(page: 1, pageSize: 1, from: $since) {
      pageInfo {
        totalCount
      }
    }
  }
`;

export const FAILED_PAYMENTS_SINCE = gql`
  query DashboardFailedPayments($since: DateTime!) {
    adminPayments(page: 1, pageSize: 1, status: FAILED, from: $since) {
      pageInfo {
        totalCount
      }
    }
  }
`;

export const OPEN_DISPUTES = gql`
  query DashboardOpenDisputes {
    adminDeals(page: 1, pageSize: 1, status: DISPUTED) {
      pageInfo {
        totalCount
      }
    }
  }
`;

export const OPEN_EVENT_REPORTS = gql`
  query DashboardOpenEventReports {
    communityEventReports(status: OPEN, page: 1, pageSize: 1) {
      pageInfo {
        totalCount
      }
    }
  }
`;
