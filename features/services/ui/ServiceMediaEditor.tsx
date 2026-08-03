"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { useServiceMutations } from "../hooks/useServiceMutations";
import type { ServiceMedia } from "../types";

function MediaRow({
  serviceId,
  existing,
  onChanged,
}: {
  serviceId: number;
  existing?: ServiceMedia;
  onChanged: () => void;
}) {
  const { t } = useTranslation("services");
  const { upsertMedia, removeMedia, loading } = useServiceMutations();
  const [mediaType, setMediaType] = useState(existing?.mediaType ?? "");
  const [url, setUrl] = useState(existing?.url ?? "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    existing ? String(existing.displayOrder) : "0",
  );
  const [isPortfolio, setIsPortfolio] = useState(existing?.isPortfolio ?? false);
  const [isCertificate, setIsCertificate] = useState(existing?.isCertificate ?? false);

  const canSave = mediaType.trim() !== "" && url.trim() !== "";

  const save = async () => {
    if (!canSave) return;
    const result = await upsertMedia([
      {
        ...(existing ? { id: existing.id } : {}),
        serviceId,
        mediaType: mediaType.trim(),
        url: url.trim(),
        title: title.trim() === "" ? null : title.trim(),
        displayOrder: Number(displayOrder) || 0,
        isPortfolio,
        isCertificate,
      },
    ]);
    if (result && result.failed === 0) onChanged();
  };

  const remove = async () => {
    if (!existing) return;
    if (!window.confirm(t("media.deleteConfirm"))) return;
    if (await removeMedia(existing.id)) onChanged();
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-light p-3">
      <div className="flex items-center justify-between">
        <Text variant="small" color="tertiary" weight="semibold">
          {existing ? `#${existing.id}` : t("media.add")}
        </Text>
        {existing && (
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("media.delete")}
            disabled={loading}
            onClick={remove}
          />
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Input
          name="mediaType"
          label={t("media.mediaType")}
          value={mediaType}
          onChangeText={setMediaType}
        />
        <Input
          name="displayOrder"
          type="number"
          label={t("media.displayOrder")}
          value={displayOrder}
          onChangeText={setDisplayOrder}
        />
      </div>
      <Input name="url" label={t("media.url")} value={url} onChangeText={setUrl} />
      <Input
        name="title"
        label={t("media.mediaTitle")}
        value={title}
        onChangeText={setTitle}
      />
      <div className="flex flex-wrap gap-4">
        <Checkbox
          name="isPortfolio"
          label={t("media.isPortfolio")}
          checked={isPortfolio}
          onChange={setIsPortfolio}
        />
        <Checkbox
          name="isCertificate"
          label={t("media.isCertificate")}
          checked={isCertificate}
          onChange={setIsCertificate}
        />
      </div>
      <div className="flex justify-end">
        <MainButton
          text={existing ? t("media.save") : t("media.add")}
          leftIcon={existing ? undefined : Plus}
          size="sm"
          loading={loading}
          disabled={!canSave}
          onPress={save}
        />
      </div>
    </div>
  );
}

/** Media rows for one service: edit/delete existing + add new. */
export function ServiceMediaEditor({
  serviceId,
  media,
  onChanged,
}: {
  serviceId: number;
  media: ServiceMedia[];
  onChanged: () => void;
}) {
  const { t } = useTranslation("services");
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <Title level="h2" size="h6" weight="semibold">
        {t("media.title")}
      </Title>
      {media.length === 0 && (
        <Text variant="small" color="tertiary">
          {t("media.empty")}
        </Text>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {media.map((m) => (
          <MediaRow key={m.id} serviceId={serviceId} existing={m} onChanged={onChanged} />
        ))}
        <MediaRow key="new" serviceId={serviceId} onChanged={onChanged} />
      </div>
    </section>
  );
}
