"use client";

import clsx from "clsx";

/** Simple labeled checkbox for boolean form fields (e.g. `isActive`). */
export function Checkbox({
  label,
  checked,
  onChange,
  name,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={clsx(
        "flex items-center gap-2 font-sans text-sm text-foreground",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}
