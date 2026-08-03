import { type SupportedLanguage } from "@/constants/settings";
import { NotificationTemplatesProvider } from "@/features/notificationTemplates/ui/NotificationTemplatesProvider";
import { NotificationTemplateFormScreen } from "@/features/notificationTemplates/ui/NotificationTemplateFormScreen";

export default async function EditNotificationTemplatePage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <NotificationTemplatesProvider lang={lang}>
      <NotificationTemplateFormScreen lang={lang} id={Number(id)} />
    </NotificationTemplatesProvider>
  );
}
