"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import Textarea from "@/components/Textarea/Textarea";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { useServiceMutations } from "../hooks/useServiceMutations";
import type { ServiceFaq } from "../types";

function FaqRow({
  serviceId,
  existing,
  onChanged,
}: {
  serviceId: number;
  existing?: ServiceFaq;
  onChanged: () => void;
}) {
  const { t } = useTranslation("services");
  const { upsertFaqs, removeFaq, loading } = useServiceMutations();
  const [question, setQuestion] = useState(existing?.question ?? "");
  const [answer, setAnswer] = useState(existing?.answer ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    existing ? String(existing.displayOrder) : "0",
  );
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);

  const canSave = question.trim() !== "" && answer.trim() !== "";

  const save = async () => {
    if (!canSave) return;
    const result = await upsertFaqs([
      {
        ...(existing ? { id: existing.id } : {}),
        serviceId,
        question: question.trim(),
        answer: answer.trim(),
        displayOrder: Number(displayOrder) || 0,
        isActive,
      },
    ]);
    if (result && result.failed === 0) onChanged();
  };

  const remove = async () => {
    if (!existing) return;
    if (!window.confirm(t("faqs.deleteConfirm"))) return;
    if (await removeFaq(existing.id)) onChanged();
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-light p-3">
      <div className="flex items-center justify-between">
        <Text variant="small" color="tertiary" weight="semibold">
          {existing ? `#${existing.id}` : t("faqs.add")}
        </Text>
        {existing && (
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("faqs.delete")}
            disabled={loading}
            onClick={remove}
          />
        )}
      </div>
      <Input
        name="question"
        label={t("faqs.question")}
        value={question}
        onChangeText={setQuestion}
      />
      <Textarea
        name="answer"
        label={t("faqs.answer")}
        rows={3}
        value={answer}
        onChangeText={setAnswer}
      />
      <div className="flex flex-wrap items-center gap-4">
        <Input
          name="displayOrder"
          type="number"
          label={t("faqs.displayOrder")}
          value={displayOrder}
          onChangeText={setDisplayOrder}
        />
        <Checkbox
          name="isActive"
          label={t("faqs.isActive")}
          checked={isActive}
          onChange={setIsActive}
        />
      </div>
      <div className="flex justify-end">
        <MainButton
          text={existing ? t("faqs.save") : t("faqs.add")}
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

/** FAQ rows for one service: edit/delete existing + add new. */
export function ServiceFaqEditor({
  serviceId,
  faqs,
  onChanged,
}: {
  serviceId: number;
  faqs: ServiceFaq[];
  onChanged: () => void;
}) {
  const { t } = useTranslation("services");
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <Title level="h2" size="h6" weight="semibold">
        {t("faqs.title")}
      </Title>
      {faqs.length === 0 && (
        <Text variant="small" color="tertiary">
          {t("faqs.empty")}
        </Text>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {faqs.map((f) => (
          <FaqRow key={f.id} serviceId={serviceId} existing={f} onChanged={onChanged} />
        ))}
        <FaqRow key="new" serviceId={serviceId} onChanged={onChanged} />
      </div>
    </section>
  );
}
