import { type SupportedLanguage } from "@/constants/settings";
import { ProviderCredentialsProvider } from "@/features/providerCredentials/ui/ProviderCredentialsProvider";
import { ProviderCredentialFormScreen } from "@/features/providerCredentials/ui/ProviderCredentialFormScreen";

export default async function NewProviderCredentialPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ProviderCredentialsProvider lang={lang}>
      <ProviderCredentialFormScreen lang={lang} />
    </ProviderCredentialsProvider>
  );
}
