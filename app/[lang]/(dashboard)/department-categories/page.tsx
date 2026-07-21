import { type SupportedLanguage } from "@/constants/settings";
import { DepartmentCategoriesScreen } from "@/features/marketplace/ui/DepartmentCategoriesScreen";
import { MarketplaceProvider } from "@/features/marketplace/ui/MarketplaceProvider";

export default async function DepartmentCategoriesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <MarketplaceProvider lang={lang}>
      <DepartmentCategoriesScreen lang={lang} />
    </MarketplaceProvider>
  );
}
