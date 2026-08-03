import { type SupportedLanguage } from "@/constants/settings";
import { AdvertisementsProvider } from "@/features/advertisements/ui/AdvertisementsProvider";
import { AdvertisementFormScreen } from "@/features/advertisements/ui/AdvertisementFormScreen";

export default async function EditAdvertisementPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <AdvertisementsProvider lang={lang}>
      <AdvertisementFormScreen lang={lang} id={Number(id)} />
    </AdvertisementsProvider>
  );
}
