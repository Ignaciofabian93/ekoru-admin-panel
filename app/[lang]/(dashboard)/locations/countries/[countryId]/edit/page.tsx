import { type SupportedLanguage } from "@/constants/settings";
import { CountryEditScreen } from "@/features/locations/ui/CountryEditScreen";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";

export default async function EditCountryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; countryId: string }>;
}) {
  const { lang, countryId } = await params;
  return (
    <LocationsProvider lang={lang}>
      <CountryEditScreen id={Number(countryId)} lang={lang} />
    </LocationsProvider>
  );
}
