import { type SupportedLanguage } from "@/constants/settings";
import { OperationsProvider } from "@/features/operations/ui/OperationsProvider";
import { PaymentDetailScreen } from "@/features/operations/ui/PaymentDetailScreen";

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <OperationsProvider lang={lang}>
      <PaymentDetailScreen id={id} lang={lang} />
    </OperationsProvider>
  );
}
