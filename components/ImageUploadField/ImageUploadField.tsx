"use client";

import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { Text } from "@/components/Text/Text";
import { IconButton } from "@/components/IconButton/IconButton";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";

/**
 * Single cover-image field: shows the current image (a CDN URL) with replace /
 * remove controls, or an upload dropzone when empty. Uploads go through the
 * same-origin asset proxy (gateway → image-processor → R2) via `useImageUpload`;
 * the resulting CDN URL is handed back through `onChange` and stored in the
 * entity's `coverImage`.
 */
export function ImageUploadField({
  value,
  onChange,
  entityId,
  label,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Namespaces the R2 key, e.g. "blog" or "event". */
  entityId: string;
  label: string;
}) {
  const { t } = useTranslation();
  const notify = useToast();
  const { upload, uploading } = useImageUpload(entityId);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const url = await upload(file);
    if (url) onChange(url);
    else notify.error(t("common.error"));
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-sans text-sm font-medium text-foreground">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-border-light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="max-h-56 w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-1">
            <IconButton
              icon={Upload}
              label={t("common.edit")}
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            />
            <IconButton
              icon={Trash2}
              tone="danger"
              label={t("common.delete")}
              disabled={uploading}
              onClick={() => onChange(null)}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full max-w-md cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-input-border bg-background-secondary px-4 py-8 text-center transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ImagePlus size={24} className="text-foreground-tertiary" />
          <Text variant="small" color="tertiary">
            {uploading ? t("common.loading") : t("common.upload")}
          </Text>
        </button>
      )}
    </div>
  );
}
