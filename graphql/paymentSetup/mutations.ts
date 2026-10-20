import { gql } from "@apollo/client";
import { STORE_PAYMENT_SETUP_FIELDS } from "./queries";

// A business connects the Mercado Pago account its sales are paid into
// (TRX-5). start → the browser goes to Mercado Pago → it comes back to
// /payment-setup with `code` and `state` → complete.

export const START_MERCADOPAGO_CONNECTION = gql`
  mutation StartMercadoPagoConnection {
    startMercadoPagoConnection
  }
`;

export const COMPLETE_MERCADOPAGO_CONNECTION = gql`
  ${STORE_PAYMENT_SETUP_FIELDS}
  mutation CompleteMercadoPagoConnection($oauthCode: String!, $oauthState: String!) {
    completeMercadoPagoConnection(oauthCode: $oauthCode, oauthState: $oauthState) {
      ...StorePaymentSetupFields
    }
  }
`;

export const DISCONNECT_MERCADOPAGO = gql`
  ${STORE_PAYMENT_SETUP_FIELDS}
  mutation DisconnectMercadoPago {
    disconnectMercadoPago {
      ...StorePaymentSetupFields
    }
  }
`;
