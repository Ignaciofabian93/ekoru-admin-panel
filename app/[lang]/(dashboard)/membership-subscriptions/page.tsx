import { type SupportedLanguage } from "@/constants/settings";
import { OperationsProvider } from "@/features/operations/ui/OperationsProvider";
import { SubscriptionsScreen } from "@/features/operations/ui/SubscriptionsScreen";

export default async function MembershipSubscriptionsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <OperationsProvider lang={lang}>
      <SubscriptionsScreen lang={lang} />
    </OperationsProvider>
  );
}
