import { type SupportedLanguage } from "@/constants/settings";
import { OperationsProvider } from "@/features/operations/ui/OperationsProvider";
import { ReviewsScreen } from "@/features/operations/ui/ReviewsScreen";

export default async function ServiceReviewsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <OperationsProvider lang={lang}>
      <ReviewsScreen kind="service" lang={lang} />
    </OperationsProvider>
  );
}
