import { type SupportedLanguage } from "@/constants/settings";
import { MarketplaceProvider } from "@/features/marketplace/ui/MarketplaceProvider";
import { ProductCategoryFormScreen } from "@/features/marketplace/ui/ProductCategoryFormScreen";

export default async function EditProductCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <MarketplaceProvider lang={lang}>
      <ProductCategoryFormScreen lang={lang} id={Number(id)} />
    </MarketplaceProvider>
  );
}
