import { type SupportedLanguage } from "@/constants/settings";
import { ServiceCatalogProvider } from "@/features/serviceCatalog/ui/ServiceCatalogProvider";
import { ServiceCategoryFormScreen } from "@/features/serviceCatalog/ui/ServiceCategoryFormScreen";

export default async function NewServiceCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ServiceCatalogProvider lang={lang}>
      <ServiceCategoryFormScreen lang={lang} />
    </ServiceCatalogProvider>
  );
}
