import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getDashboardDictionary, NAMESPACE } from "@/features/dashboard/i18n";
import { DashboardShell } from "@/features/dashboard/ui/DashboardShell";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // Next's typed routes require `lang: string` here; the parent `[lang]/layout`
  // already validates the locale (notFound otherwise), so the cast is safe.
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDashboardDictionary(lang as SupportedLanguage);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <DashboardShell lang={lang as SupportedLanguage}>{children}</DashboardShell>
    </DictionaryProvider>
  );
}
