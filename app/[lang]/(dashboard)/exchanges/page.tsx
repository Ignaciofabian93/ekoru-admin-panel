import { type SupportedLanguage } from "@/constants/settings";
import { OperationsProvider } from "@/features/operations/ui/OperationsProvider";
import { DealsScreen } from "@/features/operations/ui/DealsScreen";

export default async function ExchangesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <OperationsProvider lang={lang}>
      <DealsScreen lang={lang} />
    </OperationsProvider>
  );
}
