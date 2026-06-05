import { type SupportedLanguage } from "@/constants/settings";
import { CountryDetailScreen } from "@/features/locations/ui/CountryDetailScreen";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; countryId: string }>;
}) {
  const { lang, countryId } = await params;
  return (
    <LocationsProvider lang={lang}>
      <CountryDetailScreen countryId={Number(countryId)} lang={lang} />
    </LocationsProvider>
  );
}
