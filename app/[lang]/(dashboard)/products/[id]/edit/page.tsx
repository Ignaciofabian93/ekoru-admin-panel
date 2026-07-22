import { type SupportedLanguage } from "@/constants/settings";
import { ProductsProvider } from "@/features/products/ui/ProductsProvider";
import { ProductFormScreen } from "@/features/products/ui/ProductFormScreen";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <ProductsProvider lang={lang}>
      <ProductFormScreen lang={lang} id={Number(id)} />
    </ProductsProvider>
  );
}
