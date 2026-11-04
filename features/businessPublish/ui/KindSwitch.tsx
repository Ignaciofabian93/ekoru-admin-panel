"use client";

import clsx from "clsx";
import type { CatalogKind } from "../catalog";

/** Switches a MIXED business between its two catalogs. */
export function KindSwitch({
  kinds,
  value,
  onChange,
  label,
}: {
  kinds: CatalogKind[];
  value: CatalogKind;
  onChange: (kind: CatalogKind) => void;
  label: (kind: CatalogKind) => string;
}) {
  if (kinds.length < 2) return null;
  return (
    <div className="flex gap-1 self-start rounded-lg border border-border bg-surface p-1">
      {kinds.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={clsx(
            "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
            k === value
              ? "bg-primary text-white"
              : "text-foreground-secondary hover:bg-background-tertiary",
          )}
        >
          {label(k)}
        </button>
      ))}
    </div>
  );
}
