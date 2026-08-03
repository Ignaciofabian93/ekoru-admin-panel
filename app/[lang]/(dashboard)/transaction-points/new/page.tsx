import { type SupportedLanguage } from "@/constants/settings";
import { TransactionConfigProvider } from "@/features/transactionConfig/ui/TransactionConfigProvider";
import { TransactionConfigFormScreen } from "@/features/transactionConfig/ui/TransactionConfigFormScreen";

export default async function NewTransactionPointPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <TransactionConfigProvider lang={lang}>
      <TransactionConfigFormScreen kind="points" lang={lang} />
    </TransactionConfigProvider>
  );
}
