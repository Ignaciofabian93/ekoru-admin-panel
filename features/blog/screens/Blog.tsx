import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { ScaffoldScreen } from "@/components/ScaffoldScreen/ScaffoldScreen";
import { DictionaryProvider } from "@/i18n/context";
import { getBlogDictionary, NAMESPACE } from "../i18n";

export async function Blog({ lang }: { lang: SupportedLanguage }) {
  const dict = await getBlogDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <PermissionGate
        adminType="PLATFORM"
        permission="WRITE_BLOG"
        fallback={<AccessDenied />}
      >
        <ScaffoldScreen namespace={NAMESPACE} />
      </PermissionGate>
    </DictionaryProvider>
  );
}
