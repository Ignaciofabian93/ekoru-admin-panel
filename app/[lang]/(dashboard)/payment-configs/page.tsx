import { type SupportedLanguage } from "@/constants/settings";
import { PaymentConfigsProvider } from "@/features/paymentConfigs/ui/PaymentConfigsProvider";
import { PaymentConfigsScreen } from "@/features/paymentConfigs/ui/PaymentConfigsScreen";

export default async function PaymentConfigsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <PaymentConfigsProvider lang={lang}>
      <PaymentConfigsScreen lang={lang} />
    </PaymentConfigsProvider>
  );
}
