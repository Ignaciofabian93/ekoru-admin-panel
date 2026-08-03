import { type SupportedLanguage } from "@/constants/settings";
import { NotificationTemplatesProvider } from "@/features/notificationTemplates/ui/NotificationTemplatesProvider";
import { NotificationTemplatesScreen } from "@/features/notificationTemplates/ui/NotificationTemplatesScreen";

export default async function NotificationTemplatesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <NotificationTemplatesProvider lang={lang}>
      <NotificationTemplatesScreen lang={lang} />
    </NotificationTemplatesProvider>
  );
}
