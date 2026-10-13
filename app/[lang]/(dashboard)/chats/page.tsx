import { type SupportedLanguage } from "@/constants/settings";
import { OperationsProvider } from "@/features/operations/ui/OperationsProvider";
import { ChatModerationScreen } from "@/features/operations/ui/ChatModerationScreen";

export default async function ChatsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <OperationsProvider lang={lang}>
      <ChatModerationScreen lang={lang} />
    </OperationsProvider>
  );
}
