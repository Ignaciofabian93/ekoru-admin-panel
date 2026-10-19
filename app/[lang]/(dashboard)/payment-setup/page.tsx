import { type SupportedLanguage } from "@/constants/settings";
import { PaymentSetup } from "@/features/paymentSetup/screens/PaymentSetup";

// Also Mercado Pago's OAuth redirect target: it lands on /payment-setup?code=…&state=…
// and the proxy adds the language prefix, keeping the query.
export default async function PaymentSetupPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <PaymentSetup lang={lang} />;
}
