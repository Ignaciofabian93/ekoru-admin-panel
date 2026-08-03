import { type SupportedLanguage } from "@/constants/settings";
import { ServicePackagesProvider } from "@/features/servicePackages/ui/ServicePackagesProvider";
import { ServicePackageFormScreen } from "@/features/servicePackages/ui/ServicePackageFormScreen";

export default async function NewServicePackagePage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ServicePackagesProvider lang={lang}>
      <ServicePackageFormScreen lang={lang} />
    </ServicePackagesProvider>
  );
}
