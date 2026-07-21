import { type SupportedLanguage } from "@/constants/settings";
import { StoresProvider } from "@/features/stores/ui/StoresProvider";
import { StoreSubCategoryFormScreen } from "@/features/stores/ui/StoreSubCategoryFormScreen";

export default async function EditStoreSubCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <StoresProvider lang={lang}>
      <StoreSubCategoryFormScreen lang={lang} id={Number(id)} />
    </StoresProvider>
  );
}
