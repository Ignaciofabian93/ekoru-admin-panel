import { type SupportedLanguage } from "@/constants/settings";
import { NotificationTemplatesProvider } from "@/features/notificationTemplates/ui/NotificationTemplatesProvider";
import { NotificationTemplateFormScreen } from "@/features/notificationTemplates/ui/NotificationTemplateFormScreen";

export default async function NewNotificationTemplatePage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <NotificationTemplatesProvider lang={lang}>
      <NotificationTemplateFormScreen lang={lang} />
    </NotificationTemplatesProvider>
  );
}
