import { type SupportedLanguage } from "@/constants/settings";
import { LocationNodeEditScreen } from "@/features/locations/ui/LocationNodeEditScreen";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";

export default async function EditCountyPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: SupportedLanguage; countyId: string }>;
  searchParams: Promise<{ countryId?: string; regionId?: string; cityId?: string }>;
}) {
  const { lang, countyId } = await params;
  const { countryId, regionId, cityId } = await searchParams;
  return (
    <LocationsProvider lang={lang}>
      <LocationNodeEditScreen
        level="county"
        lang={lang}
        countryId={Number(countryId)}
        regionId={Number(regionId)}
        cityId={Number(cityId)}
        nodeId={Number(countyId)}
      />
    </LocationsProvider>
  );
}
