import { type SupportedLanguage } from "@/constants/settings";
import { LocationNodeEditScreen } from "@/features/locations/ui/LocationNodeEditScreen";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";

export default async function EditRegionPage({
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
      <LocationNodeEditScreen
        level="region"
        lang={lang}
        countryId={Number(countryId)}
        nodeId={Number(regionId)}
      />
    </LocationsProvider>
  );
}
