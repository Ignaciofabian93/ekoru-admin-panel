import { type SupportedLanguage } from "@/constants/settings";
import { ProductsProvider } from "@/features/products/ui/ProductsProvider";
import { ProductFormScreen } from "@/features/products/ui/ProductFormScreen";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ProductsProvider lang={lang}>
      <ProductFormScreen lang={lang} />
    </ProductsProvider>
  );
}
