import { type SupportedLanguage } from "@/constants/settings";
import { ServiceCatalogProvider } from "@/features/serviceCatalog/ui/ServiceCatalogProvider";
import { ServiceCategoryFormScreen } from "@/features/serviceCatalog/ui/ServiceCategoryFormScreen";

export default async function EditServiceCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <ServiceCatalogProvider lang={lang}>
      <ServiceCategoryFormScreen lang={lang} id={Number(id)} />
    </ServiceCatalogProvider>
  );
}
