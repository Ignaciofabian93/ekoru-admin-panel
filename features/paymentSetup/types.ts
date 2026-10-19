/** A store's Mercado Pago connection, as `myStorePaymentSetup` returns it. */
export type StorePaymentSetup = {
  provider: "MERCADOPAGO" | "WEBPAY" | "KHIPU";
  connected: boolean;
  /** It was connected, but the authorization expired or was revoked. */
  needsReconnect: boolean;
  /** The Mercado Pago user id of the connected account. */
  accountId: string | null;
  environment: "SANDBOX" | "PRODUCTION" | null;
  connectedAt: string | null;
  tokenExpiresAt: string | null;
  /** EKORU's commission as a fraction (0.05 = 5%). */
  commissionRate: number;
};
