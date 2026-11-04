import { gql } from "@apollo/client";

// What a store's panel team sees of the orders it received (USR-15), the
// same as the web's "Mis ventas". ekoru-transactions scopes both reads to the
// caller's store for a business account with MANAGE_BUSINESS_ORDERS, and
// ekoru-users shows the buyer's contact once the order is paid.
const ORDER_FIELDS = `
  id
  status
  subtotal
  shippingCost
  total
  currency
  createdAt
  shippingMethod
  shippingStatus {
    id
    status
    trackingInfo
  }
  buyer {
    id
    email
    phone
    profile {
      ... on PersonProfile {
        id
        displayName
        firstName
        lastName
      }
      ... on BusinessProfile {
        id
        businessName
      }
    }
  }
  orderItems {
    id
    quantity
    price
    storeProductId
    storeProduct {
      id
      name
      images
    }
  }
`;

export const BUSINESS_ORDERS = gql`
  query BusinessOrders(
    $page: Int!
    $pageSize: Int!
    $status: OrderStatus
    $stage: ShippingStage
  ) {
    getOrdersBySeller(page: $page, pageSize: $pageSize, status: $status, stage: $stage) {
      nodes {
        ${ORDER_FIELDS}
      }
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
    toShip: getOrdersBySeller(page: 1, pageSize: 1, status: PAID, stage: PREPARING) {
      pageInfo {
        totalCount
      }
    }
  }
`;

export const BUSINESS_ORDER = gql`
  query BusinessOrder($id: ID!) {
    getOrder(id: $id) {
      ${ORDER_FIELDS}
      shippingAddress {
        id
        recipientName
        phone
        countryId
        regionId
        cityId
        countyId
        street
        reference
        zipCode
      }
    }
  }
`;
