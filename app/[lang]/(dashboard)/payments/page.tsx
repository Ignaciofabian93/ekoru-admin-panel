import { type SupportedLanguage } from "@/constants/settings";
import { OperationsProvider } from "@/features/operations/ui/OperationsProvider";
import { PaymentsScreen } from "@/features/operations/ui/PaymentsScreen";

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <OperationsProvider lang={lang}>
      <PaymentsScreen lang={lang} />
    </OperationsProvider>
  );
}
