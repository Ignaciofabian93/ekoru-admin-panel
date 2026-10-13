import { gql } from "@apollo/client";

const PAGE_INFO = `
  pageInfo {
    totalCount
    totalPages
    currentPage
    hasNextPage
    hasPreviousPage
  }
`;

const PARTY = `{ id email }`;

/** Orders across the platform (ekoru-transactions `adminOrders`, TRX-11). */
export const ADMIN_ORDERS = gql`
  query AdminOrders(
    $page: Int!
    $pageSize: Int!
    $status: OrderStatus
    $email: String
    $orderId: Int
    $from: DateTime
    $to: DateTime
  ) {
    adminOrders(
      page: $page
      pageSize: $pageSize
      status: $status
      email: $email
      orderId: $orderId
      from: $from
      to: $to
    ) {
      nodes {
        id
        status
        total
        currency
        shippingMethod
        createdAt
        buyerId
        sellerId
        shippingStatus {
          status
        }
        buyer ${PARTY}
        seller ${PARTY}
      }
      ${PAGE_INFO}
    }
  }
`;

/** One order with its lines and address (`getOrder` lets order admins through). */
export const ADMIN_ORDER = gql`
  query AdminOrder($id: ID!) {
    getOrder(id: $id) {
      id
      status
      subtotal
      shippingCost
      taxAmount
      total
      currency
      shippingMethod
      createdAt
      updatedAt
      buyerId
      sellerId
      shippingStatus {
        status
      }
      shippingAddress {
        recipientName
        phone
        street
        reference
        zipCode
      }
      orderItems {
        id
        productId
        storeProductId
        quantity
        price
      }
      buyer ${PARTY}
      seller ${PARTY}
    }
  }
`;

/** Payments across the platform (`adminPayments`). */
export const ADMIN_PAYMENTS = gql`
  query AdminPayments(
    $page: Int!
    $pageSize: Int!
    $status: PaymentStatus
    $paymentType: PaymentType
    $email: String
    $orderId: Int
    $quotationId: Int
    $externalId: String
    $from: DateTime
    $to: DateTime
  ) {
    adminPayments(
      page: $page
      pageSize: $pageSize
      status: $status
      paymentType: $paymentType
      email: $email
      orderId: $orderId
      quotationId: $quotationId
      externalId: $externalId
      from: $from
      to: $to
    ) {
      nodes {
        id
        status
        paymentType
        paymentProvider
        amount
        currency
        orderId
        quotationId
        externalId
        failureReason
        createdAt
        processedAt
        refundedAt
        payer ${PARTY}
        receiver ${PARTY}
      }
      ${PAGE_INFO}
    }
  }
`;

/** One payment and its refunds. */
export const ADMIN_PAYMENT = gql`
  query AdminPayment($id: ID!, $paymentId: Int!) {
    getPayment(id: $id) {
      id
      status
      paymentType
      paymentProvider
      amount
      currency
      orderId
      quotationId
      externalId
      description
      failureReason
      createdAt
      processedAt
      refundedAt
      payer ${PARTY}
      receiver ${PARTY}
    }
    adminPaymentRefunds(paymentId: $paymentId) {
      id
      amount
      reason
      status
      createdAt
    }
  }
`;

/** P2P deals across the platform, disputes included (`adminDeals`). */
export const ADMIN_DEALS = gql`
  query AdminDeals(
    $page: Int!
    $pageSize: Int!
    $status: P2PStatus
    $email: String
    $from: DateTime
    $to: DateTime
  ) {
    adminDeals(
      page: $page
      pageSize: $pageSize
      status: $status
      email: $email
      from: $from
      to: $to
    ) {
      nodes {
        id
        type
        status
        compensationAmount
        agreedAt
        confirmationDeadline
        buyerConfirmedAt
        sellerConfirmedAt
        buyerEvidenceUrl
        sellerEvidenceUrl
        disputedAt
        disputeReason
        cancelReason
        createdAt
        buyerId
        sellerId
        buyer ${PARTY}
        seller ${PARTY}
      }
      ${PAGE_INFO}
    }
  }
`;

/** Service bookings across the platform (ekoru-services, MANAGE_ORDERS). */
export const ADMIN_BOOKINGS = gql`
  query AdminServiceBookings($page: Int!, $pageSize: Int!, $status: String) {
    getServiceBookings(page: $page, pageSize: $pageSize, status: $status) {
      nodes {
        id
        status
        scheduledDate
        scheduledTimeSlot
        agreedPrice
        clientNotes
        providerNotes
        cancellationReason
        cancelledBy
        createdAt
        clientId
        providerId
        client ${PARTY}
        provider ${PARTY}
        service {
          id
          name
        }
      }
      ${PAGE_INFO}
    }
  }
`;

/** Quotations in one state (ekoru-services, MANAGE_ORDERS). */
export const ADMIN_QUOTATIONS = gql`
  query AdminQuotations($status: QuotationStatus!, $page: Int!, $pageSize: Int!) {
    getQuotationsByStatus(status: $status, page: $page, pageSize: $pageSize) {
      nodes {
        id
        title
        status
        estimatedPrice
        finalPrice
        paidAt
        declineReason
        cancellationReason
        createdAt
        clientId
        providerId
        client ${PARTY}
        provider ${PARTY}
        service {
          id
          name
        }
      }
      ${PAGE_INFO}
    }
  }
`;

/** Store product reviews for moderation (ekoru-stores, MODERATE_CONTENT). */
export const ADMIN_STORE_REVIEWS = gql`
  query AdminStoreProductReviews($page: Int!, $pageSize: Int!, $rating: Int) {
    adminStoreProductReviews(page: $page, pageSize: $pageSize, rating: $rating) {
      nodes {
        id
        storeProductId
        userId
        rating
        comment
        isVerifiedPurchase
        createdAt
      }
      ${PAGE_INFO}
    }
  }
`;

/** Service reviews for moderation (ekoru-services, MODERATE_CONTENT). */
export const ADMIN_SERVICE_REVIEWS = gql`
  query AdminServiceReviews($page: Int!, $pageSize: Int!, $rating: Int) {
    adminServiceReviews(page: $page, pageSize: $pageSize, rating: $rating) {
      nodes {
        id
        serviceId
        reviewerId
        rating
        comment
        isVerifiedPurchase
        createdAt
        service {
          id
          name
        }
        reviewer ${PARTY}
      }
      ${PAGE_INFO}
    }
  }
`;

/** What admins did, newest first (ekoru-users, VIEW_SYSTEM_LOGS). */
export const ADMIN_ACTIVITY = gql`
  query AdminActivityLogs(
    $page: Int!
    $pageSize: Int!
    $action: String
    $entityType: String
    $from: DateTime
    $to: DateTime
  ) {
    adminActivityLogs(
      page: $page
      pageSize: $pageSize
      action: $action
      entityType: $entityType
      from: $from
      to: $to
    ) {
      nodes {
        id
        adminId
        adminEmail
        action
        entityType
        entityId
        changes
        metadata
        createdAt
      }
      ${PAGE_INFO}
    }
  }
`;

/** Person or business membership terms with plan and payment (ADM-12). */
export const ADMIN_MEMBERSHIP_SUBSCRIPTIONS = gql`
  query AdminMembershipSubscriptions(
    $page: Int!
    $pageSize: Int!
    $kind: MembershipKind
    $active: Boolean
    $plan: String
    $endsBefore: DateTime
    $search: String
  ) {
    adminMembershipSubscriptions(
      page: $page
      pageSize: $pageSize
      kind: $kind
      active: $active
      plan: $plan
      endsBefore: $endsBefore
      search: $search
    ) {
      nodes {
        id
        kind
        sellerId
        sellerEmail
        sellerName
        membershipId
        plan
        planName
        startDate
        endDate
        isActive
        autoRenew
        paymentId
        paymentAmount
        paymentStatus
        paymentProvider
        createdAt
      }
      ${PAGE_INFO}
    }
  }
`;
