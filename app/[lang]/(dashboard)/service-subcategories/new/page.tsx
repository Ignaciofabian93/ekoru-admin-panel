import { type SupportedLanguage } from "@/constants/settings";
import { ServiceCatalogProvider } from "@/features/serviceCatalog/ui/ServiceCatalogProvider";
import { ServiceSubCategoryFormScreen } from "@/features/serviceCatalog/ui/ServiceSubCategoryFormScreen";

export default async function NewServiceSubCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ServiceCatalogProvider lang={lang}>
      <ServiceSubCategoryFormScreen lang={lang} />
    </ServiceCatalogProvider>
  );
}
