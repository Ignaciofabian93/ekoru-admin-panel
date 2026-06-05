import { type SupportedLanguage } from "@/constants/settings";
import { CityDetailScreen } from "@/features/locations/ui/CityDetailScreen";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";

export default async function CityDetailPage({
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
      <CityDetailScreen
        countryId={Number(countryId)}
        regionId={Number(regionId)}
        cityId={Number(cityId)}
        lang={lang}
      />
    </LocationsProvider>
  );
}
