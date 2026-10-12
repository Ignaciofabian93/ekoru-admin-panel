import { type SupportedLanguage } from "@/constants/settings";
import { OperationsProvider } from "@/features/operations/ui/OperationsProvider";
import { ActivityScreen } from "@/features/operations/ui/ActivityScreen";

export default async function AdminActivityPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <OperationsProvider lang={lang}>
      <ActivityScreen lang={lang} />
    </OperationsProvider>
  );
}
