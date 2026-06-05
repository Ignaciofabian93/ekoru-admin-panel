import { type SupportedLanguage } from "@/constants/settings";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";
import { RegionDetailScreen } from "@/features/locations/ui/RegionDetailScreen";

export default async function RegionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: SupportedLanguage; regionId: string }>;
  searchParams: Promise<{ countryId?: string }>;
}) {
  const { lang, regionId } = await params;
  const { countryId } = await searchParams;
  return (
    <LocationsProvider lang={lang}>
      <RegionDetailScreen
        countryId={Number(countryId)}
        regionId={Number(regionId)}
        lang={lang}
      />
    </LocationsProvider>
  );
}
