import { type SupportedLanguage } from "@/constants/settings";
import { TransactionConfigProvider } from "@/features/transactionConfig/ui/TransactionConfigProvider";
import { TransactionConfigFormScreen } from "@/features/transactionConfig/ui/TransactionConfigFormScreen";

export default async function NewTransactionFeePage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <TransactionConfigProvider lang={lang}>
      <TransactionConfigFormScreen kind="fees" lang={lang} />
    </TransactionConfigProvider>
  );
}
