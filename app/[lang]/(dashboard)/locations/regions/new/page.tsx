import { type SupportedLanguage } from "@/constants/settings";
import { LocationNodeForm } from "@/features/locations/ui/LocationNodeForm";
import { LocationsProvider } from "@/features/locations/ui/LocationsProvider";

export default async function NewRegionPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
  searchParams: Promise<{ countryId?: string }>;
}) {
  const { lang } = await params;
  const { countryId } = await searchParams;
  return (
    <LocationsProvider lang={lang}>
      <LocationNodeForm
        level="region"
        mode="create"
        lang={lang}
        countryId={Number(countryId)}
      />
    </LocationsProvider>
  );
}
