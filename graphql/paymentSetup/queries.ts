import { gql } from "@apollo/client";

// The signed-in business's Mercado Pago connection (ekoru-transactions
// MercadoPagoConnectResolver). BUSINESS admins only; never carries a token.

export const STORE_PAYMENT_SETUP_FIELDS = `
  provider
  connected
  needsReconnect
  accountId
  environment
  connectedAt
  tokenExpiresAt
  commissionRate
`;

export const GET_MY_STORE_PAYMENT_SETUP = gql`
  query MyStorePaymentSetup {
    myStorePaymentSetup {
      ${STORE_PAYMENT_SETUP_FIELDS}
    }
  }
`;
