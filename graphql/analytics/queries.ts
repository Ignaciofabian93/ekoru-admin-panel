import { gql } from "@apollo/client";

/**
 * The dashboards (ADM-13/16), served by ekoru-search's analytics module.
 * `platformAnalytics` needs VIEW_ANALYTICS and returns EKORU-wide totals only;
 * the `business*` queries return the caller's own business and need a business
 * admin with VIEW_BUSINESS_ANALYTICS.
 */

const PERIOD = `
  period {
    range
    bucket
    from
    to
    previousFrom
  }
`;

const PLATFORM_TOTALS = `
  grossSales
  revenue
  commissions
  memberships
  payments
  averageTicket
  refunded
  failedPayments
  transactions
  newSellers
  co2SavedKg
  waterSavedLt
  views
  searches
`;

const SEARCH_TERM = `
  query
  searches
  clicks
`;

export const PLATFORM_ANALYTICS = gql`
  query PlatformAnalytics($range: AnalyticsRange!, $language: Language) {
    platformAnalytics(range: $range, language: $language) {
      ${PERIOD}
      current { ${PLATFORM_TOTALS} }
      previous { ${PLATFORM_TOTALS} }
      series {
        bucket
        grossSales
        revenue
        storeOrders
        serviceQuotes
        serviceBookings
        marketplaceSales
        exchanges
        memberships
        newPersons
        newStartups
        newCompanies
        views
      }
      transactionsByKind { key count amount }
      paymentsByStatus { key count amount }
      newSellersByType { key count amount }
      topSearches { ${SEARCH_TERM} }
      unmetSearches { ${SEARCH_TERM} }
      topCategories { catalog name views }
      listings { marketplace store services }
    }
  }
`;

const BUSINESS_TOTALS = `
  grossSales
  fees
  refunded
  netPayout
  orders
  paidQuotes
  averageTicket
  quotesRequested
  quotesAccepted
  bookings
  deals
  views
  likes
  conversionRate
  reviews
  co2SavedKg
  waterSavedLt
`;

export const BUSINESS_ANALYTICS = gql`
  query BusinessAnalytics($range: AnalyticsRange!) {
    businessAnalytics(range: $range) {
      ${PERIOD}
      current { ${BUSINESS_TOTALS} }
      previous { ${BUSINESS_TOTALS} }
      series { bucket grossSales netPayout orders views }
      rating
    }
  }
`;

export const BUSINESS_ITEM_PERFORMANCE = gql`
  query BusinessItemPerformance($range: AnalyticsRange!) {
    businessItemPerformance(range: $range) {
      itemId
      itemType
      name
      isActive
      views
      likes
      totalLikes
      unitsSold
      revenue
      quoteRequests
      bookings
      conversionRate
      rating
      reviews
    }
  }
`;

export const BUSINESS_SALES = gql`
  query BusinessSales($range: AnalyticsRange!, $page: Int!, $pageSize: Int!) {
    businessSales(range: $range, page: $page, pageSize: $pageSize) {
      nodes {
        paymentId
        date
        type
        orderId
        quotationId
        status
        amount
        fee
        refunded
        net
        units
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        totalCount
        totalPages
        currentPage
        pageSize
      }
    }
  }
`;

export const BUSINESS_SEARCH_INSIGHTS = gql`
  query BusinessSearchInsights($range: AnalyticsRange!) {
    businessSearchInsights(range: $range) {
      ${PERIOD}
      foundBy { ${SEARCH_TERM} }
      viewsBySource { key count }
      topSearches { ${SEARCH_TERM} }
      unmetSearches { ${SEARCH_TERM} }
    }
  }
`;
