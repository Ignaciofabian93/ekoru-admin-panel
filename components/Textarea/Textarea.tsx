"use client";

import clsx from "clsx";
import React from "react";

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> {
  label?: string;
  name?: string;
  errorMessage?: string;
  hasError?: boolean;
  /** Helper text shown below the field when there is no error. */
  hint?: string;
  onChangeText?: (value: string) => void;
}

/** Presentational multiline input, styled to match `Input`. */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      name,
      errorMessage,
      hasError,
      hint,
      onChangeText,
      className,
      rows = 4,
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

        <textarea
          ref={ref}
          id={name}
          name={name}
          rows={rows}
          onChange={(e) => onChangeText?.(e.target.value)}
          className={clsx(
            "w-full resize-y rounded-md border-2 border-solid bg-input-bg px-3 py-2 font-sans text-base text-input-text outline-none transition-[border-color] duration-150",
            hasError
              ? "border-danger"
              : "border-input-border focus:border-input-border-focus",
            className,
          )}
          {...rest}
        />

        {hint && !hasError && (
          <span className="font-sans text-xs text-foreground-tertiary">{hint}</span>
        )}
        {hasError && errorMessage && (
          <span className="font-sans text-xs font-normal text-danger">
            {errorMessage}
          </span>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
export { Textarea };
