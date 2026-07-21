import { type SupportedLanguage } from "@/constants/settings";
import { DepartmentFormScreen } from "@/features/marketplace/ui/DepartmentFormScreen";
import { MarketplaceProvider } from "@/features/marketplace/ui/MarketplaceProvider";

export default async function NewDepartmentPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <MarketplaceProvider lang={lang}>
      <DepartmentFormScreen lang={lang} />
    </MarketplaceProvider>
  );
}
