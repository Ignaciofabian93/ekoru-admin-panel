import { type SupportedLanguage } from "@/constants/settings";
import { PaymentConfigsProvider } from "@/features/paymentConfigs/ui/PaymentConfigsProvider";
import { PaymentConfigFormScreen } from "@/features/paymentConfigs/ui/PaymentConfigFormScreen";

export default async function EditPaymentConfigPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <PaymentConfigsProvider lang={lang}>
      <PaymentConfigFormScreen lang={lang} id={id} />
    </PaymentConfigsProvider>
  );
}
