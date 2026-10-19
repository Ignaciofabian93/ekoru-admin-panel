"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { GET_MY_STORE_PAYMENT_SETUP } from "@/graphql/paymentSetup/queries";
import {
  COMPLETE_MERCADOPAGO_CONNECTION,
  DISCONNECT_MERCADOPAGO,
  START_MERCADOPAGO_CONNECTION,
} from "@/graphql/paymentSetup/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { useAdmin } from "@/store/useAuthStore";
import { hasPermission } from "@/utils/permissions";
import { NAMESPACE } from "../i18n";
import type { StorePaymentSetup } from "../types";

const messageOf = (error: unknown) => (error instanceof Error ? error.message : "");

/**
 * The business's Mercado Pago connection and the three things it can do with
 * it. Connecting is a round trip: `connect` sends the browser to Mercado Pago,
 * which returns it here with `code` and `state`; this hook finishes the
 * connection once and cleans the URL, because a code works only once.
 */
export function usePaymentSetup({ lang }: { lang: string }) {
  const { t } = useTranslation(NAMESPACE);
  const toast = useToast();
  const router = useRouter();
  const admin = useAdmin();
  // The backend lets the owner, or anyone holding MANAGE_BUSINESS_PROFILE, change it.
  const canManage =
    admin?.role === "BUSINESS_OWNER" || hasPermission(admin, "MANAGE_BUSINESS_PROFILE");

  const { data, loading, refetch } = useQuery<{
    myStorePaymentSetup: StorePaymentSetup;
  }>(GET_MY_STORE_PAYMENT_SETUP, { fetchPolicy: "cache-and-network" });

  const [startM, start] = useMutation<{ startMercadoPagoConnection: string }>(
    START_MERCADOPAGO_CONNECTION,
  );
  const [completeM, complete] = useMutation<{
    completeMercadoPagoConnection: StorePaymentSetup;
  }>(COMPLETE_MERCADOPAGO_CONNECTION);
  const [disconnectM, disconnect] = useMutation<{
    disconnectMercadoPago: StorePaymentSetup;
  }>(DISCONNECT_MERCADOPAGO);

  const handled = useRef(false);

  // Back from Mercado Pago: ?code=…&state=… (or ?error=… when the business declined).
  useEffect(() => {
    if (handled.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const declined = params.get("error");
    if (!code && !declined) return;
    handled.current = true;
    const clean = () => router.replace(`/${lang}/payment-setup`);

    if (declined || !code || !state) {
      toast.error(t("feedback.declined"));
      clean();
      return;
    }
    completeM({ variables: { oauthCode: code, oauthState: state } })
      .then(async () => {
        toast.success(t("feedback.connected"));
        await refetch();
      })
      .catch((error: unknown) => toast.error(messageOf(error) || t("feedback.error")))
      .finally(clean);
  }, [completeM, lang, refetch, router, t, toast]);

  const connect = async () => {
    try {
      const { data: started } = await startM();
      const url = started?.startMercadoPagoConnection;
      if (!url) throw new Error(t("feedback.error"));
      window.location.assign(url);
    } catch (error) {
      toast.error(messageOf(error) || t("feedback.error"));
    }
  };

  const unlink = async () => {
    if (!window.confirm(t("disconnect.confirm"))) return;
    try {
      await disconnectM();
      toast.success(t("feedback.disconnected"));
      await refetch();
    } catch (error) {
      toast.error(messageOf(error) || t("feedback.error"));
    }
  };

  return {
    setup: data?.myStorePaymentSetup ?? null,
    loading: loading && !data,
    canManage,
    // Back from Mercado Pago and still exchanging the code.
    finishing: complete.loading,
    busy: start.loading || complete.loading || disconnect.loading,
    connect,
    unlink,
  };
}
