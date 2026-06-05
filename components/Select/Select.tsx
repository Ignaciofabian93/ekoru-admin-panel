"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import React from "react";

export type SelectOption = { value: string; label: string };

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "size"
> {
  label?: string;
  name?: string;
  options: SelectOption[];
  /** Optional leading empty option. */
  placeholder?: string;
  errorMessage?: string;
  hasError?: boolean;
  onChangeValue?: (value: string) => void;
}

/**
 * Presentational labeled `<select>`. Mirrors the look of `Input` (border tokens,
 * error state) and stays dumb about data — feed it `{ value, label }` options.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      name,
      options,
      placeholder,
      errorMessage,
      hasError,
      onChangeValue,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <div className="flex flex-col gap-px">
        {label && (
          <label htmlFor={name} className="font-sans text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={name}
            name={name}
            onChange={(e) => onChangeValue?.(e.target.value)}
            className={clsx(
              "h-11 w-full cursor-pointer appearance-none rounded-md border-2 border-solid bg-input-bg px-3 pr-9 font-sans text-base text-input-text outline-none transition-[border-color] duration-150",
              hasError
                ? "border-danger"
                : "border-input-border focus:border-input-border-focus",
              className,
            )}
            {...rest}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 text-foreground-tertiary"
          />
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
