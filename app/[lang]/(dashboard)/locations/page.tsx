import { type SupportedLanguage } from "@/constants/settings";
import { CountriesScreen } from "@/features/locations/ui/CountriesScreen";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <LocationsProvider lang={lang}>
      <CountriesScreen lang={lang} />
    </LocationsProvider>
  );
}
