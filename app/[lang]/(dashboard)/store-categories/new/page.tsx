import { type SupportedLanguage } from "@/constants/settings";
import { StoresProvider } from "@/features/stores/ui/StoresProvider";
import { StoreCategoryFormScreen } from "@/features/stores/ui/StoreCategoryFormScreen";

export default async function NewStoreCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <StoresProvider lang={lang}>
      <StoreCategoryFormScreen lang={lang} />
    </StoresProvider>
  );
}
