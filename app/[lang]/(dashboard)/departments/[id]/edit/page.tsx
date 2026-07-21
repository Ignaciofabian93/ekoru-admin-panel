import { type SupportedLanguage } from "@/constants/settings";
import { DepartmentFormScreen } from "@/features/marketplace/ui/DepartmentFormScreen";
import { MarketplaceProvider } from "@/features/marketplace/ui/MarketplaceProvider";

export default async function EditDepartmentPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <MarketplaceProvider lang={lang}>
      <DepartmentFormScreen lang={lang} id={Number(id)} />
    </MarketplaceProvider>
  );
}
