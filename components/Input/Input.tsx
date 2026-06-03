"use client";

import clsx from "clsx";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import React, { useState } from "react";

type Variant = "default" | "filled" | "outline";
type Size = "sm" | "md" | "lg";
type Width = "sm" | "md" | "lg" | "full";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "size"
> {
  label?: string;
  name?: string;
  leftIcon?: LucideIcon;
  errorMessage?: string;
  size?: Size;
  width?: Width;
  variant?: Variant;
  type?: "text" | "email" | "password" | "number" | "search";
  hasError?: boolean;
  isInvalid?: boolean;
  onChangeText?: (value: string) => void;
}

const SIZE_CLASS: Record<
  Size,
  { h: string; text: string; px: string; padLeft: string; padRight: string; icon: number }
> = {
  sm: {
    h: "h-9",
    text: "text-xs",
    px: "px-2.5",
    padLeft: "pl-8",
    padRight: "pr-8",
    icon: 14,
  },
  md: {
    h: "h-11",
    text: "text-base",
    px: "px-3",
    padLeft: "pl-9",
    padRight: "pr-9",
    icon: 16,
  },
  lg: {
    h: "h-14",
    text: "text-lg",
    px: "px-3.5",
    padLeft: "pl-10",
    padRight: "pr-10",
    icon: 18,
  },
};

const WIDTH_CLASS: Record<Width, string> = {
  sm: "w-1/3",
  md: "w-1/2",
  lg: "w-2/3",
  full: "w-full",
};

const VARIANT_CLASS: Record<Variant, string> = {
  default: "bg-input-bg border-input-border focus:border-input-border-focus",
  filled:
    "bg-background-secondary border-transparent focus:bg-input-bg focus:border-input-border-focus",
  outline: "bg-transparent border-primary focus:bg-primary/5 focus:border-primary-active",
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      name,
      leftIcon: LeftIcon,
      errorMessage,
      size = "md",
      width = "full",
      variant = "default",
      type = "text",
      hasError,
      isInvalid,
      placeholder,
      maxLength = 120,
      onFocus,
      onBlur,
      onChangeText,
      ...rest
    },
    ref,
  ) => {
    const s = SIZE_CLASS[size];
    const showError = hasError || isInvalid;

    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeText?.(e.target.value);
    };

    return (
      <div className={clsx("relative flex flex-col gap-px", WIDTH_CLASS[width])}>
        {label && (
          <label htmlFor={name} className="font-sans text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <div className={clsx("group relative flex items-center", s.h)}>
          {LeftIcon && (
            <div
              className={clsx(
                "pointer-events-none absolute left-3 z-1 flex",
                showError
                  ? "text-danger"
                  : "text-foreground-tertiary group-focus-within:text-primary",
              )}
            >
              <LeftIcon size={s.icon} color="currentColor" strokeWidth={2} />
            </div>
          )}

          <input
            ref={ref}
            id={name}
            name={name}
            type={resolvedType}
            placeholder={placeholder}
            maxLength={maxLength}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={handleChange}
            className={clsx(
              "box-border h-full w-full rounded-md border-2 border-solid font-sans font-normal text-input-text outline-none transition-[border-color,background-color] duration-150",
              s.text,
              s.px,
              LeftIcon && s.padLeft,
              isPassword && s.padRight,
              showError ? "border-danger" : VARIANT_CLASS[variant],
            )}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 flex cursor-pointer items-center p-0 text-foreground-tertiary transition-opacity duration-75"
            >
              {showPassword ? (
                <EyeOff size={s.icon} color="currentColor" strokeWidth={2} />
              ) : (
                <Eye size={s.icon} color="currentColor" strokeWidth={2} />
              )}
            </button>
          )}
        </div>

        {showError && errorMessage && (
          <span className="absolute -bottom-4.5 font-sans text-xs font-normal text-danger">
            {errorMessage}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
export { Input };
