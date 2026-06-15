"use client";

import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

export interface SelectProps {
  label?: string;
  name?: string;
  id?: string;
  options: SelectOption[];
  /** Text shown when nothing is selected (and as a non-selectable hint). */
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  errorMessage?: string;
  hasError?: boolean;
  onChangeValue?: (value: string) => void;
  className?: string;
}

/**
 * Labeled dropdown built as a custom listbox (not a native `<select>`) so the
 * open menu can carry the same rounded borders, colors and shadow as the rest
 * of the UI — native `<option>` popups can't be styled cross-browser. Keeps the
 * old `Select` API (`value` / `onChangeValue` / `options`), so it stays a
 * drop-in for every caller. Fully keyboard-accessible.
 */
const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      name,
      id,
      options,
      placeholder,
      value,
      disabled,
      errorMessage,
      hasError,
      onChangeValue,
      className,
    },
    ref,
  ) => {
    const reactId = useId();
    const triggerId = id ?? name ?? reactId;
    const listboxId = `${triggerId}-listbox`;

    const [open, setOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Forward the trigger node to the parent ref while keeping a local handle
    // for positioning math.
    const setButtonRef = (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    };

    const selectedIndex = options.findIndex((o) => o.value === value);
    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    // Close when clicking outside the component.
    useEffect(() => {
      if (!open) return;
      const onPointerDown = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", onPointerDown);
      return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    // Keep the highlighted option scrolled into view while navigating.
    useEffect(() => {
      if (!open || activeIndex < 0) return;
      const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    const openMenu = () => {
      if (disabled) return;
      // Flip the menu above the trigger when there isn't room below it (e.g.
      // a filter near the page bottom, or a select low in a modal).
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const MENU_MAX = 240; // matches max-h-60
        const spaceBelow = window.innerHeight - rect.bottom;
        setDropUp(spaceBelow < MENU_MAX && rect.top > spaceBelow);
      }
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      setOpen(true);
    };

    const choose = (option: SelectOption) => {
      onChangeValue?.(option.value);
      setOpen(false);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (!open) {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
          e.preventDefault();
          openMenu();
        }
        return;
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => Math.min(options.length - 1, i + 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) => Math.max(0, i - 1));
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(options.length - 1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (options[activeIndex]) choose(options[activeIndex]);
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    };

    return (
      <div className="flex flex-col gap-px" ref={rootRef}>
        {label && (
          <label
            htmlFor={triggerId}
            className="font-sans text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <button
            ref={setButtonRef}
            type="button"
            id={triggerId}
            disabled={disabled}
            onClick={() => (open ? setOpen(false) : openMenu())}
            onKeyDown={onKeyDown}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            className={clsx(
              "flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-md border-2 border-solid bg-input-bg px-3 font-sans text-base outline-none transition-[border-color] duration-150 disabled:cursor-not-allowed disabled:opacity-60",
              selected ? "text-input-text" : "text-input-placeholder",
              hasError
                ? "border-danger"
                : open
                  ? "border-input-border-focus"
                  : "border-input-border",
              className,
            )}
          >
            <span className="truncate">
              {selected ? selected.label : (placeholder ?? "")}
            </span>
            <ChevronDown
              size={16}
              className={clsx(
                "shrink-0 text-foreground-tertiary transition-transform duration-150",
                open && "rotate-180",
              )}
            />
          </button>

          {open && (
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              tabIndex={-1}
              aria-activedescendant={
                activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
              }
              className={clsx(
                "absolute left-0 right-0 z-20 max-h-60 overflow-auto rounded-md border-2 border-input-border bg-surface py-1 shadow-lg",
                dropUp ? "bottom-full mb-1" : "top-full mt-1",
              )}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                return (
                  <li
                    key={option.value}
                    id={`${listboxId}-opt-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    // Prevent the trigger from losing focus before the click lands.
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(option)}
                    className={clsx(
                      "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 font-sans text-sm transition-colors",
                      isActive && "bg-surface-hover",
                      isSelected ? "font-semibold text-primary" : "text-foreground",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check size={16} className="shrink-0 text-primary" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {hasError && errorMessage && (
          <span className="font-sans text-xs font-normal text-danger">
            {errorMessage}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
export { Select };
