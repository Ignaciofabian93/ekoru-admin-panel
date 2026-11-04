"use client";

import { useRef } from "react";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { IconButton } from "@/components/IconButton/IconButton";
import { Text } from "@/components/Text/Text";
import { formatMoney } from "@/features/operations/types";
import { useTranslation } from "@/i18n/context";
import { resolveImageUrl } from "@/utils/imageUrl";
import { NAMESPACE } from "../i18n";
import {
  MAX_ITEM_IMAGES,
  needsPhoto,
  type CatalogItem,
  type CatalogKind,
} from "../types";

/**
 * One listing: its photos (the first is the cover), what it costs, and
 * whether EKORU shows it. A store product without a photo can't be shown.
 */
export function CatalogItemRow({
  item,
  kind,
  busy,
  onAddPhotos,
  onRemovePhoto,
  onSetCover,
  onSetVisible,
}: {
  item: CatalogItem;
  kind: CatalogKind;
  busy: boolean;
  onAddPhotos: (files: File[]) => void;
  onRemovePhoto: (key: string) => void;
  onSetCover: (key: string) => void;
  onSetVisible: (isActive: boolean) => void;
}) {
  const { t } = useTranslation(NAMESPACE);
  const input = useRef<HTMLInputElement>(null);
  const blocked = needsPhoto(kind) && item.images.length === 0;
  const details = [
    t("item.id", { id: String(item.id) }),
    item.quoted ? t("item.quoted") : formatMoney(item.price),
    item.stock != null ? t("item.stock", { count: String(item.stock) }) : null,
  ].filter(Boolean);

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex shrink-0 gap-2">
        {item.images.map((key, index) => (
          <div
            key={key}
            className="group relative size-20 overflow-hidden rounded-md border border-border bg-background-tertiary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(key) ?? ""}
              alt={t("item.photoAlt", { name: item.name })}
              className="size-full object-cover"
            />
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 text-[10px] font-semibold text-on-primary">
                {t("item.cover")}
              </span>
            )}
            <div className="absolute right-1 top-1 flex gap-0.5 rounded-md bg-surface/90 focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0">
              {index > 0 && (
                <IconButton
                  icon={Star}
                  label={t("item.makeCover")}
                  disabled={busy}
                  onClick={() => onSetCover(key)}
                />
              )}
              <IconButton
                icon={Trash2}
                tone="danger"
                label={t("item.remove")}
                disabled={busy}
                onClick={() => onRemovePhoto(key)}
              />
            </div>
          </div>
        ))}
        {item.images.length < MAX_ITEM_IMAGES && (
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="flex size-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-input-border px-1 text-center text-foreground-tertiary transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ImagePlus size={18} />
            )}
            <span className="text-[11px] font-semibold leading-tight">
              {t("item.addPhoto")}
            </span>
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) onAddPhotos(files);
          }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Text variant="span" weight="semibold" className="truncate">
          {item.name || "—"}
        </Text>
        <Text variant="small" color="secondary">
          {details.join(" · ")}
        </Text>
        <Text variant="small" color="tertiary">
          {t("item.photos", {
            count: String(item.images.length),
            max: String(MAX_ITEM_IMAGES),
          })}
        </Text>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <Badge tone={item.isActive ? "success" : "neutral"}>
          {t(item.isActive ? "item.visible" : "item.hidden")}
        </Badge>
        <MainButton
          text={t(item.isActive ? "item.hide" : "item.show")}
          variant={item.isActive ? "outline" : "primary"}
          size="sm"
          disabled={busy || (!item.isActive && blocked)}
          onPress={() => onSetVisible(!item.isActive)}
        />
        {!item.isActive && blocked && (
          <Text variant="small" color="tertiary">
            {t("item.needsPhoto")}
          </Text>
        )}
      </div>
    </li>
  );
}
