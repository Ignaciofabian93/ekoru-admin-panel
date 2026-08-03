import { type SupportedLanguage } from "@/constants/settings";
import { TransactionConfigProvider } from "@/features/transactionConfig/ui/TransactionConfigProvider";
import { TransactionConfigScreen } from "@/features/transactionConfig/ui/TransactionConfigScreen";

export default async function ShippingStatusesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <TransactionConfigProvider lang={lang}>
      <TransactionConfigScreen kind="shippingStatus" lang={lang} />
    </TransactionConfigProvider>
  );
}
