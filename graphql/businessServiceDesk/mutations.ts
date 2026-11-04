import { gql } from "@apollo/client";

// What a service business's panel team does with what it received (USR-15).
// ekoru-services lets a business account with MANAGE_BUSINESS_ORDERS act as
// its store on the provider side only; cancelling reuses the operator
// mutations (`ADMIN_CANCEL_BOOKING`, `ADMIN_CANCEL_QUOTATION`).
export const MOVE_BOOKING = gql`
  mutation BusinessMoveBooking($input: UpdateServiceBookingInput!) {
    updateServiceBooking(input: $input) {
      id
      status
    }
  }
`;

export const COMPLETE_BOOKING = gql`
  mutation BusinessCompleteBooking($id: ID!) {
    completeServiceBooking(id: $id) {
      id
      status
    }
  }
`;

export const REPLY_QUOTATION = gql`
  mutation BusinessReplyQuotation($input: UpdateQuotationInput!) {
    updateQuotation(input: $input) {
      id
      status
      estimatedPrice
      estimatedDuration
      providerNotes
    }
  }
`;

export const COMPLETE_QUOTATION = gql`
  mutation BusinessCompleteQuotation($id: ID!) {
    completeQuotation(id: $id) {
      id
      status
    }
  }
`;
