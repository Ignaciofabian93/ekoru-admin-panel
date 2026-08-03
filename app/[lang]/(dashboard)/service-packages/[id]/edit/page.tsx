import { type SupportedLanguage } from "@/constants/settings";
import { ServicePackagesProvider } from "@/features/servicePackages/ui/ServicePackagesProvider";
import { ServicePackageFormScreen } from "@/features/servicePackages/ui/ServicePackageFormScreen";

export default async function EditServicePackagePage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <ServicePackagesProvider lang={lang}>
      <ServicePackageFormScreen lang={lang} id={Number(id)} />
    </ServicePackagesProvider>
  );
}
