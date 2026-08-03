import { type SupportedLanguage } from "@/constants/settings";
import { TransactionConfigProvider } from "@/features/transactionConfig/ui/TransactionConfigProvider";
import { TransactionConfigFormScreen } from "@/features/transactionConfig/ui/TransactionConfigFormScreen";

export default async function EditTransactionFeePage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <TransactionConfigProvider lang={lang}>
      <TransactionConfigFormScreen kind="fees" lang={lang} id={id} />
    </TransactionConfigProvider>
  );
}
