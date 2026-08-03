import { type SupportedLanguage } from "@/constants/settings";
import { ProviderCredentialsProvider } from "@/features/providerCredentials/ui/ProviderCredentialsProvider";
import { ProviderCredentialFormScreen } from "@/features/providerCredentials/ui/ProviderCredentialFormScreen";

export default async function EditProviderCredentialPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <ProviderCredentialsProvider lang={lang}>
      <ProviderCredentialFormScreen lang={lang} id={Number(id)} />
    </ProviderCredentialsProvider>
  );
}
