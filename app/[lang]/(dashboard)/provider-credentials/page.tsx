import { type SupportedLanguage } from "@/constants/settings";
import { ProviderCredentialsProvider } from "@/features/providerCredentials/ui/ProviderCredentialsProvider";
import { ProviderCredentialsScreen } from "@/features/providerCredentials/ui/ProviderCredentialsScreen";

export default async function ProviderCredentialsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ProviderCredentialsProvider lang={lang}>
      <ProviderCredentialsScreen lang={lang} />
    </ProviderCredentialsProvider>
  );
}
