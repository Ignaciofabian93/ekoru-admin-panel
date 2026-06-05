import { type SupportedLanguage } from "@/constants/settings";
import { LocationNodeForm } from "@/features/locations/ui/LocationNodeForm";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";

export default async function NewCountyPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
  searchParams: Promise<{ countryId?: string; regionId?: string; cityId?: string }>;
}) {
  const { lang } = await params;
  const { countryId, regionId, cityId } = await searchParams;
  return (
    <LocationsProvider lang={lang}>
      <LocationNodeForm
        level="county"
        mode="create"
        lang={lang}
        countryId={Number(countryId)}
        regionId={Number(regionId)}
        cityId={Number(cityId)}
      />
    </LocationsProvider>
  );
}
