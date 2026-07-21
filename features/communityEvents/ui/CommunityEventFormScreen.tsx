"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { FormShell } from "@/components/FormShell/FormShell";
import { ImageUploadField } from "@/components/ImageUploadField/ImageUploadField";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Textarea } from "@/components/Textarea/Textarea";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useCommunityEvent } from "../hooks/useCommunityEvents";
import { useCommunityEventMutations } from "../hooks/useCommunityEventMutations";
import { fromDateInputValue, toDateInputValue } from "../utils";
import type { CommunityEvent } from "../types";
import { CommunityRegistrationsPanel } from "./CommunityRegistrationsPanel";

function CommunityEventForm({
  lang,
  event,
  onSaved,
}: {
  lang: SupportedLanguage;
  event: CommunityEvent | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("communityEvents");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { loading, createEvent, updateEvent, deleteEvent } = useCommunityEventMutations();

  const listRoute = `/${lang}/community-posts`;

  const [title, setTitle] = useState(event?.title ?? "");
  const [content, setContent] = useState(event?.content ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(event?.coverImage ?? null);
  const [startDate, setStartDate] = useState(toDateInputValue(event?.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(event?.endDate));
  const [capacity, setCapacity] = useState(
    event?.capacity != null ? String(event.capacity) : "",
  );

  const canSave = title.trim() && content.trim();

  const buildInput = () => ({
    title: title.trim(),
    content: content.trim(),
    coverImage,
    startDate: fromDateInputValue(startDate),
    endDate: fromDateInputValue(endDate),
    capacity: capacity.trim() === "" ? null : Number(capacity),
  });

  const save = async () => {
    if (!canSave) return;
    if (event) {
      if (await updateEvent(event.id, buildInput())) onSaved();
      return;
    }
    const id = await createEvent(buildInput());
    if (id != null) navigateTo({ route: `/${lang}/community-posts/${id}/edit` });
  };

  const removeEvent = async () => {
    if (!event) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    if (await deleteEvent(event.id)) navigateTo({ route: listRoute });
  };

  return (
    <FormShell
      backHref={listRoute}
      backLabel={t("actions.backToList")}
      title={event ? t("editTitle", { id: String(event.id) }) : t("newTitle")}
      subtitle={t("formSubtitle")}
      actions={
        event ? (
          <MainButton
            text={tc("common.delete")}
            leftIcon={Trash2}
            variant="outline"
            size="sm"
            disabled={loading}
            onPress={removeEvent}
          />
        ) : undefined
      }
    >
      <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.baseData")}
        </Title>

        <ImageUploadField
          label={t("fields.coverImage")}
          entityId="community"
          value={coverImage}
          onChange={setCoverImage}
        />

        <Input
          name="title"
          label={t("fields.title")}
          value={title}
          onChangeText={setTitle}
        />

        <Textarea
          name="content"
          label={t("fields.content")}
          value={content}
          onChangeText={setContent}
          rows={6}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            name="startDate"
            type="date"
            label={t("fields.startDate")}
            value={startDate}
            onChangeText={setStartDate}
          />
          <Input
            name="endDate"
            type="date"
            label={t("fields.endDate")}
            value={endDate}
            onChangeText={setEndDate}
          />
          <Input
            name="capacity"
            type="number"
            label={t("fields.capacity")}
            placeholder={t("unlimited")}
            value={capacity}
            onChangeText={setCapacity}
          />
        </div>
        <Text variant="small" color="tertiary">
          {t("fields.dateHint")}
        </Text>

        <div className="flex justify-end">
          <MainButton
            text={tc("common.save")}
            size="sm"
            loading={loading}
            disabled={!canSave}
            onPress={() => void save()}
          />
        </div>
      </section>

      {event && <CommunityRegistrationsPanel event={event} lang={lang} />}
    </FormShell>
  );
}

/** Create (no id) or edit (id) screen for a community event. */
export function CommunityEventFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("communityEvents");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { event, loading, refetch } = useCommunityEvent(id ?? Number.NaN);

  if (isEdit && loading && !event) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {tc("common.loading")}
        </Text>
      </div>
    );
  }

  if (isEdit && !loading && !event) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {t("notFound")}
        </Text>
      </div>
    );
  }

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MODERATE_CONTENT"
      fallback={<AccessDenied />}
    >
      <CommunityEventForm
        key={event ? `${event.id}-${event.updatedAt}` : "new"}
        lang={lang}
        event={event}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
