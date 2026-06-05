"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

/** Compact icon-only button for table row actions (edit/delete). */
export function IconButton({
  icon: Icon,
  onClick,
  label,
  tone = "default",
  disabled = false,
}: {
  icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  tone?: "default" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={clsx(
        "inline-flex items-center justify-center rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        tone === "danger"
          ? "text-foreground-tertiary hover:bg-danger/10 hover:text-danger"
          : "text-foreground-tertiary hover:bg-surface-hover hover:text-foreground",
      )}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
}
