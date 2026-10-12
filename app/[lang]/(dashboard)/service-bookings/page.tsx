import { type SupportedLanguage } from "@/constants/settings";
import { OperationsProvider } from "@/features/operations/ui/OperationsProvider";
import { BookingsScreen } from "@/features/operations/ui/BookingsScreen";

export default async function ServiceBookingsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <OperationsProvider lang={lang}>
      <BookingsScreen lang={lang} />
    </OperationsProvider>
  );
}
