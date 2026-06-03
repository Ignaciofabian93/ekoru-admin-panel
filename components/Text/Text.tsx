import clsx from "clsx";
import React from "react";

type Variant = "p" | "span" | "label" | "blockquote" | "small" | "code";
type Size = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
type Weight = "normal" | "medium" | "semibold" | "bold";
type TextColor =
  | "default"
  | "primary"
  | "primaryDark"
  | "secondary"
  | "tertiary"
  | "error"
  | "success"
  | "warning"
  | "muted"
  | "white";
type Align = "left" | "center" | "right" | "justify";

export interface TextProps {
  variant?: Variant;
  size?: Size;
  weight?: Weight;
  color?: TextColor;
  align?: Align;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Maps to CSS line-clamp */
  numberOfLines?: number;
  className?: string;
  onClick?: React.MouseEventHandler;
}

const SIZE_CLASS: Record<Size, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

const WEIGHT_CLASS: Record<Weight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const COLOR_CLASS: Record<TextColor, string> = {
  default: "text-foreground",
  primary: "text-primary",
  primaryDark: "text-primary-dark",
  secondary: "text-foreground-secondary",
  tertiary: "text-foreground-tertiary",
  muted: "text-foreground-muted",
  error: "text-danger",
  success: "text-success",
  warning: "text-warning",
  white: "text-white",
};

const ALIGN_CLASS: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

const LINE_CLAMP_CLASS: Record<number, string> = {
  1: "truncate",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

const VARIANT_DEFAULTS: Partial<Record<Variant, { size?: Size; weight?: Weight }>> = {
  label: { weight: "medium" },
  small: { size: "xs" },
  code: { size: "sm" },
};

const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      variant = "p",
      size,
      weight,
      color = "default",
      align = "left",
      style,
      children,
      numberOfLines,
      className,
      onClick,
    },
    ref,
  ) => {
    const defaults = VARIANT_DEFAULTS[variant] ?? {};
    const resolvedSize = size ?? defaults.size ?? "base";
    const resolvedWeight = weight ?? defaults.weight ?? "normal";

    const computed = clsx(
      "m-0 font-sans",
      SIZE_CLASS[resolvedSize],
      WEIGHT_CLASS[resolvedWeight],
      COLOR_CLASS[color],
      ALIGN_CLASS[align],
      numberOfLines && LINE_CLAMP_CLASS[numberOfLines],
      variant === "blockquote" && "italic pl-3",
      variant === "code" && "font-mono bg-background-secondary rounded-[4px] px-1 py-0.5",
    );

    const sharedProps = {
      ref: ref as never,
      style,
      className: clsx(computed, className),
      onClick,
    };

    if (variant === "blockquote") {
      return (
        <div className="flex items-stretch gap-2.5 py-0.5">
          <div className="w-0.75 shrink-0 rounded-xs bg-primary" />
          <blockquote {...sharedProps}>{children}</blockquote>
        </div>
      );
    }

    if (variant === "code") return <code {...sharedProps}>{children}</code>;
    if (variant === "span") return <span {...sharedProps}>{children}</span>;
    if (variant === "label") return <label {...sharedProps}>{children}</label>;
    if (variant === "small") return <small {...sharedProps}>{children}</small>;
    return <p {...sharedProps}>{children}</p>;
  },
);

Text.displayName = "Text";

export { Text };
