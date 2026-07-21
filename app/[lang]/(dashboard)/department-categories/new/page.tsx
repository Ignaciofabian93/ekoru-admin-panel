import { type SupportedLanguage } from "@/constants/settings";
import { DepartmentCategoryFormScreen } from "@/features/marketplace/ui/DepartmentCategoryFormScreen";
import { MarketplaceProvider } from "@/features/marketplace/ui/MarketplaceProvider";

export default async function NewDepartmentCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <MarketplaceProvider lang={lang}>
      <DepartmentCategoryFormScreen lang={lang} />
    </MarketplaceProvider>
  );
}
