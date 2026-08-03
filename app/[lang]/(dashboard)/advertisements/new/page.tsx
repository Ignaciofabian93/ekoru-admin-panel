import { type SupportedLanguage } from "@/constants/settings";
import { AdvertisementsProvider } from "@/features/advertisements/ui/AdvertisementsProvider";
import { AdvertisementFormScreen } from "@/features/advertisements/ui/AdvertisementFormScreen";

export default async function NewAdvertisementPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <AdvertisementsProvider lang={lang}>
      <AdvertisementFormScreen lang={lang} />
    </AdvertisementsProvider>
  );
}
