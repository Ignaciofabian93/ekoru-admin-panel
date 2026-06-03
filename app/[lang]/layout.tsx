import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Cabin } from "next/font/google";

import { hasLocale, SUPPORTED_LANGUAGES } from "@/constants/settings";
import { SITE_NAME, HREFLANG } from "@/config/site";
import { getDictionary } from "@/i18n/dictionaries";
import { DictionaryProvider } from "@/i18n/context";
import { ApolloWrapper } from "@/lib/apollo/ApolloWrapper";
import { ToastProvider } from "@/components/Toast/ToastProvider";

const cabin = Cabin({
  variable: "--font-cabin",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#65a30d",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return {
    title: {
      default: dict.metadata.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: dict.metadata.description,
    applicationName: SITE_NAME,
    // Admin console must never be indexed.
    robots: { index: false, follow: false },
  };
}

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <html
      lang={HREFLANG[lang] ?? lang}
      className={`${cabin.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        <ApolloWrapper>
          <DictionaryProvider dictionary={dict}>{children}</DictionaryProvider>
        </ApolloWrapper>
        <ToastProvider />
      </body>
    </html>
  );
}
