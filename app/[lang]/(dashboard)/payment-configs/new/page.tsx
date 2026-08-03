import { type SupportedLanguage } from "@/constants/settings";
import { PaymentConfigsProvider } from "@/features/paymentConfigs/ui/PaymentConfigsProvider";
import { PaymentConfigFormScreen } from "@/features/paymentConfigs/ui/PaymentConfigFormScreen";

export default async function NewPaymentConfigPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <PaymentConfigsProvider lang={lang}>
      <PaymentConfigFormScreen lang={lang} />
    </PaymentConfigsProvider>
  );
}
