import { type SupportedLanguage } from "@/constants/settings";
import { StoresProvider } from "@/features/stores/ui/StoresProvider";
import { StoreCategoryFormScreen } from "@/features/stores/ui/StoreCategoryFormScreen";

export default async function EditStoreCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <StoresProvider lang={lang}>
      <StoreCategoryFormScreen lang={lang} id={Number(id)} />
    </StoresProvider>
  );
}
