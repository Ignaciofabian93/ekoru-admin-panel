import { type SupportedLanguage } from "@/constants/settings";
import { LocationNodeForm } from "@/features/locations/ui/LocationNodeForm";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";

export default async function NewCityPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
  searchParams: Promise<{ countryId?: string; regionId?: string }>;
}) {
  const { lang } = await params;
  const { countryId, regionId } = await searchParams;
  return (
    <LocationsProvider lang={lang}>
      <LocationNodeForm
        level="city"
        mode="create"
        lang={lang}
        countryId={Number(countryId)}
        regionId={Number(regionId)}
      />
    </LocationsProvider>
  );
}
