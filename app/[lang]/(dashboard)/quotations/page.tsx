import { type SupportedLanguage } from "@/constants/settings";
import { OperationsProvider } from "@/features/operations/ui/OperationsProvider";
import { QuotationsScreen } from "@/features/operations/ui/QuotationsScreen";

export default async function QuotationsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <OperationsProvider lang={lang}>
      <QuotationsScreen lang={lang} />
    </OperationsProvider>
  );
}
