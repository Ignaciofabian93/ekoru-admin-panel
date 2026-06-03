"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import React from "react";

type Variant =
  | "primary"
  | "secondary"
  | "secondary_outline"
  | "outline"
  | "ghost"
  | "success"
  | "warning"
  | "error"
  | "filled";

type Size = "sm" | "md" | "lg";

export interface MainButtonProps {
  text: string;
  onPress?: () => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  leftIcon?: LucideIcon | React.ReactElement;
  rightIcon?: LucideIcon | React.ReactElement;
  fullWidth?: boolean;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const SIZE_CLASS: Record<Size, { box: string; gap: string; text: string; icon: number }> =
  {
    sm: {
      box: "min-h-8 rounded-sm px-3.5 py-2",
      gap: "gap-1",
      text: "text-sm",
      icon: 16,
    },
    md: {
      box: "min-h-10 rounded-md px-5 py-3",
      gap: "gap-2",
      text: "text-base",
      icon: 18,
    },
    lg: {
      box: "min-h-12 rounded-md px-6 py-4",
      gap: "gap-2",
      text: "text-base",
      icon: 20,
    },
  };

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-primary border-primary text-on-primary",
  filled: "bg-primary border-primary text-on-primary",
  secondary: "bg-secondary border-secondary text-on-primary",
  secondary_outline: "bg-surface border-secondary text-secondary",
  outline: "bg-surface border-primary text-primary",
  ghost: "bg-transparent border-transparent text-primary",
  success: "bg-success border-success text-on-primary",
  warning: "bg-warning border-warning text-on-primary",
  error: "bg-danger border-danger text-on-primary",
};

function renderIcon(
  icon: LucideIcon | React.ReactElement,
  size: number,
): React.ReactNode {
  if (React.isValidElement(icon)) return icon;
  const Icon = icon as LucideIcon;
  return <Icon size={size} color="currentColor" strokeWidth={2} />;
}

const MainButton = React.forwardRef<HTMLButtonElement, MainButtonProps>(
  (
    {
      text,
      onPress,
      onClick,
      variant = "primary",
      size = "md",
      loading = false,
      loadingText,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      style,
      type = "button",
      className,
    },
    ref,
  ) => {
    const s = SIZE_CLASS[size];
    const isDisabled = disabled || loading;
    const label = loading && loadingText ? loadingText : text;
    const hasBorder =
      variant === "outline" || variant === "secondary_outline" || variant === "ghost";

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      onClick?.(e);
      onPress?.();
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        disabled={isDisabled}
        style={style}
        className={clsx(
          "relative box-border inline-flex flex-row items-center justify-center min-w-35 cursor-pointer select-none border-solid outline-none transition-transform duration-100 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50",
          s.box,
          VARIANT_CLASS[variant],
          hasBorder ? "border-2" : "border-0",
          fullWidth && "w-full",
          className,
        )}
      >
        <span
          className={clsx("flex flex-row items-center", s.gap, loading && "opacity-0")}
        >
          {leftIcon && renderIcon(leftIcon, s.icon)}
          <span className={clsx("text-center font-sans font-bold", s.text)}>{label}</span>
          {rightIcon && renderIcon(rightIcon, s.icon)}
        </span>

        {loading && (
          <span className="absolute size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
      </button>
    );
  },
);

MainButton.displayName = "MainButton";

export default MainButton;
export { MainButton };
