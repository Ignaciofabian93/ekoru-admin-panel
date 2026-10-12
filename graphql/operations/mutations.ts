import { gql } from "@apollo/client";

/** Real, capped refund through the provider (PROCESS_REFUNDS, TRX-2). */
export const REFUND_PAYMENT = gql`
  mutation RefundPayment($input: RefundPaymentInput!) {
    refundPayment(input: $input) {
      id
      amount
      status
    }
  }
`;

/** Close a disputed P2P deal (MANAGE_ORDERS). */
export const RESOLVE_DEAL = gql`
  mutation ResolveDeal($id: Int!, $outcome: String!, $strikeSellerId: ID) {
    resolveDeal(id: $id, outcome: $outcome, strikeSellerId: $strikeSellerId) {
      id
      status
    }
  }
`;

/** Move an order's shipping forward (MANAGE_ORDERS). */
export const UPDATE_SHIPPING = gql`
  mutation AdminUpdateShipping($input: UpdateShippingInput!) {
    updateShipping(input: $input) {
      id
      shippingStatus {
        status
      }
    }
  }
`;

/** An operator cancels a booking when the parties disagree (ADM-5). */
export const ADMIN_CANCEL_BOOKING = gql`
  mutation AdminCancelServiceBooking($id: ID!, $reason: String!) {
    cancelServiceBooking(id: $id, reason: $reason) {
      id
      status
    }
  }
`;

/** An operator cancels a quotation when the parties disagree (ADM-5). */
export const ADMIN_CANCEL_QUOTATION = gql`
  mutation AdminCancelQuotation($id: ID!, $reason: String) {
    cancelQuotation(id: $id, reason: $reason) {
      id
      status
    }
  }
`;

/** A moderator removes a store product review; the rating is recomputed (ADM-4). */
export const DELETE_STORE_REVIEW = gql`
  mutation DeleteStoreProductReviewByAdmin($id: Int!) {
    deleteStoreProductReviewByAdmin(id: $id)
  }
`;

/** A moderator removes a service review; the rating is recomputed (ADM-4). */
export const DELETE_SERVICE_REVIEW = gql`
  mutation DeleteServiceReviewByAdmin($id: Int!) {
    deleteServiceReviewByAdmin(id: $id)
  }
`;
