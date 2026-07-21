import { type SupportedLanguage } from "@/constants/settings";
import { DepartmentCategoryFormScreen } from "@/features/marketplace/ui/DepartmentCategoryFormScreen";
import { MarketplaceProvider } from "@/features/marketplace/ui/MarketplaceProvider";

export default async function EditDepartmentCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <MarketplaceProvider lang={lang}>
      <DepartmentCategoryFormScreen lang={lang} id={Number(id)} />
    </MarketplaceProvider>
  );
}
