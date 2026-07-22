import { type SupportedLanguage } from "@/constants/settings";
import { ServiceCatalogProvider } from "@/features/serviceCatalog/ui/ServiceCatalogProvider";
import { ServiceSubCategoriesScreen } from "@/features/serviceCatalog/ui/ServiceSubCategoriesScreen";

export default async function ServiceSubCategoriesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ServiceCatalogProvider lang={lang}>
      <ServiceSubCategoriesScreen lang={lang} />
    </ServiceCatalogProvider>
  );
}
