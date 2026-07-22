import { type SupportedLanguage } from "@/constants/settings";
import { ProductsProvider } from "@/features/products/ui/ProductsProvider";
import { ProductsScreen } from "@/features/products/ui/ProductsScreen";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ProductsProvider lang={lang}>
      <ProductsScreen lang={lang} />
    </ProductsProvider>
  );
}
