import { type SupportedLanguage } from "@/constants/settings";
import { OperationsProvider } from "@/features/operations/ui/OperationsProvider";
import { OrderDetailScreen } from "@/features/operations/ui/OrderDetailScreen";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <OperationsProvider lang={lang}>
      <OrderDetailScreen id={id} lang={lang} />
    </OperationsProvider>
  );
}
