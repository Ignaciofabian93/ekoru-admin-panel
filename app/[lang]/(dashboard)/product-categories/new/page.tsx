import { type SupportedLanguage } from "@/constants/settings";
import { MarketplaceProvider } from "@/features/marketplace/ui/MarketplaceProvider";
import { ProductCategoryFormScreen } from "@/features/marketplace/ui/ProductCategoryFormScreen";

export default async function NewProductCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <MarketplaceProvider lang={lang}>
      <ProductCategoryFormScreen lang={lang} />
    </MarketplaceProvider>
  );
}
