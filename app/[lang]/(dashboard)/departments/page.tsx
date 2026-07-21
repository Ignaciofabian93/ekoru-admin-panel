import { type SupportedLanguage } from "@/constants/settings";
import { DepartmentsScreen } from "@/features/marketplace/ui/DepartmentsScreen";
import { MarketplaceProvider } from "@/features/marketplace/ui/MarketplaceProvider";

export default async function DepartmentsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <MarketplaceProvider lang={lang}>
      <DepartmentsScreen lang={lang} />
    </MarketplaceProvider>
  );
}
