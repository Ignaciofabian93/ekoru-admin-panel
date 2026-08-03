import { type SupportedLanguage } from "@/constants/settings";
import { ServicePackagesProvider } from "@/features/servicePackages/ui/ServicePackagesProvider";
import { ServicePackagesScreen } from "@/features/servicePackages/ui/ServicePackagesScreen";

export default async function ServicePackagesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ServicePackagesProvider lang={lang}>
      <ServicePackagesScreen lang={lang} />
    </ServicePackagesProvider>
  );
}
