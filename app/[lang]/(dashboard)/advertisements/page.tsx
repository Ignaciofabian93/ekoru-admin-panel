import { type SupportedLanguage } from "@/constants/settings";
import { AdvertisementsProvider } from "@/features/advertisements/ui/AdvertisementsProvider";
import { AdvertisementsScreen } from "@/features/advertisements/ui/AdvertisementsScreen";

export default async function AdvertisementsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <AdvertisementsProvider lang={lang}>
      <AdvertisementsScreen lang={lang} />
    </AdvertisementsProvider>
  );
}
