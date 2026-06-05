import { type SupportedLanguage } from "@/constants/settings";
import { CountryForm } from "@/features/locations/ui/CountryForm";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";

export default async function NewCountryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <LocationsProvider lang={lang}>
      <CountryForm mode="create" lang={lang} />
    </LocationsProvider>
  );
}
