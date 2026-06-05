"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LANGUAGES_AVAILABLE } from "@/constants/settings";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/i18n/context";
import clsx from "clsx";

/** Compact locale picker. Persists the choice via cookie and reroutes in place. */
export function LanguageSwitcher() {
  const [language, changeLanguage] = useLanguage();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const current =
    LANGUAGES_AVAILABLE.find((lang) => lang.code === language) ?? LANGUAGES_AVAILABLE[0];

  // Close on outside pointer / Escape, and move focus to the selected option on open.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);

    const selectedIndex = Math.max(
      0,
      LANGUAGES_AVAILABLE.findIndex((lang) => lang.code === language),
    );
    optionRefs.current[selectedIndex]?.focus();

    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, language]);

  const select = (code: string) => {
    changeLanguage(code);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const last = LANGUAGES_AVAILABLE.length - 1;
    const activeIndex = optionRefs.current.findIndex(
      (el) => el === document.activeElement,
    );

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        optionRefs.current[activeIndex < last ? activeIndex + 1 : 0]?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        optionRefs.current[activeIndex > 0 ? activeIndex - 1 : last]?.focus();
        break;
      case "Home":
        e.preventDefault();
        optionRefs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        optionRefs.current[last]?.focus();
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative inline-flex">
      <span id="language-label" className="sr-only">
        {t("common.language")}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="language-label"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "relative inline-flex cursor-pointer items-center rounded-md border border-border-light",
          "bg-surface py-1.5 pl-8 pr-7 font-sans text-sm text-foreground",
          "outline-none transition-colors",
          "hover:bg-surface-hover",
          open ? "border-input-border-focus" : "focus-visible:border-input-border-focus",
        )}
      >
        <Globe
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute left-2.5 text-foreground-tertiary"
        />
        {current.name}
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={clsx(
            "pointer-events-none absolute right-2 text-foreground-tertiary transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-labelledby="language-label"
          onKeyDown={onMenuKeyDown}
          className={clsx(
            "absolute left-0 top-full z-(--z-dropdown) mt-1 min-w-full overflow-hidden",
            "rounded-md border border-border-light bg-surface py-1 shadow-lg",
          )}
        >
          {LANGUAGES_AVAILABLE.map((lang, i) => {
            const selected = lang.code === language;
            return (
              <li key={lang.code} role="option" aria-selected={selected}>
                <button
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  type="button"
                  tabIndex={-1}
                  onClick={() => select(lang.code)}
                  className={clsx(
                    "flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-1.5",
                    "text-left font-sans text-sm text-foreground outline-none transition-colors",
                    "hover:bg-surface-hover focus:bg-surface-hover",
                    selected && "bg-surface-active",
                  )}
                >
                  {lang.name}
                  {selected && (
                    <Check size={14} strokeWidth={2.5} className="text-primary" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
