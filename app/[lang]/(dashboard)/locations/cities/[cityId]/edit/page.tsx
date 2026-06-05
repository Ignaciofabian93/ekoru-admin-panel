import { type SupportedLanguage } from "@/constants/settings";
import { LocationNodeEditScreen } from "@/features/locations/ui/LocationNodeEditScreen";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";

export default async function EditCityPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: SupportedLanguage; cityId: string }>;
  searchParams: Promise<{ countryId?: string; regionId?: string }>;
}) {
  const { lang, cityId } = await params;
  const { countryId, regionId } = await searchParams;
  return (
    <LocationsProvider lang={lang}>
      <LocationNodeEditScreen
        level="city"
        lang={lang}
        countryId={Number(countryId)}
        regionId={Number(regionId)}
        nodeId={Number(cityId)}
      />
    </LocationsProvider>
  );
}
