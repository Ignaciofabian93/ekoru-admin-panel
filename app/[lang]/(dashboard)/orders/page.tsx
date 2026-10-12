import { type SupportedLanguage } from "@/constants/settings";
import { OperationsProvider } from "@/features/operations/ui/OperationsProvider";
import { OrdersScreen } from "@/features/operations/ui/OrdersScreen";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <OperationsProvider lang={lang}>
      <OrdersScreen lang={lang} />
    </OperationsProvider>
  );
}
