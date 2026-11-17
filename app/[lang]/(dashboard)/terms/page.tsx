import { type SupportedLanguage } from "@/constants/settings";
import { TermsProvider } from "@/features/terms/ui/TermsProvider";
import { TermsScreen } from "@/features/terms/ui/TermsScreen";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <TermsProvider lang={lang}>
      <TermsScreen lang={lang} />
    </TermsProvider>
  );
}
