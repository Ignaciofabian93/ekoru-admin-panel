import { type SupportedLanguage } from "@/constants/settings";
import { ServiceCatalogProvider } from "@/features/serviceCatalog/ui/ServiceCatalogProvider";
import { ServiceCategoriesScreen } from "@/features/serviceCatalog/ui/ServiceCategoriesScreen";

export default async function ServiceCategoriesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ServiceCatalogProvider lang={lang}>
      <ServiceCategoriesScreen lang={lang} />
    </ServiceCatalogProvider>
  );
}
