import clsx from "clsx";
import React from "react";

type Level = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type Weight = "normal" | "medium" | "semibold" | "bold" | "extrabold";
type TitleColor =
  | "default"
  | "primary"
  | "secondary"
  | "tertiary"
  | "error"
  | "success"
  | "warning"
  | "white";
type Align = "left" | "center" | "right";

export interface TitleProps {
  level?: Level;
  /** Controls visual size independently from the semantic heading level. Defaults to matching `level`. */
  size?: Level;
  weight?: Weight;
  color?: TitleColor;
  align?: Align;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
  /** Maps to CSS line-clamp */
  numberOfLines?: number;
  onClick?: React.MouseEventHandler;
}

const SIZE_CLASS: Record<Level, string> = {
  h1: "text-[36px]",
  h2: "text-[30px]",
  h3: "text-[26px]",
  h4: "text-[22px]",
  h5: "text-[19px]",
  h6: "text-[17px]",
};

const WEIGHT_CLASS: Record<Weight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-bold",
};

const COLOR_CLASS: Record<TitleColor, string> = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-foreground-secondary",
  tertiary: "text-foreground-tertiary",
  error: "text-danger",
  success: "text-success",
  warning: "text-warning",
  white: "text-white",
};

const ALIGN_CLASS: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  (
    {
      level = "h1",
      size,
      weight = "bold",
      color = "default",
      align = "left",
      style,
      children,
      className,
      numberOfLines,
      onClick,
    },
    ref,
  ) => {
    const Tag = level;
    return (
      <Tag
        ref={ref}
        style={style}
        className={clsx(
          "m-0 font-sans leading-[1.2] tracking-[-0.4px]",
          SIZE_CLASS[size ?? level],
          WEIGHT_CLASS[weight],
          COLOR_CLASS[color],
          ALIGN_CLASS[align],
          numberOfLines === 1 && "truncate",
          className,
        )}
        onClick={onClick}
      >
        {children}
      </Tag>
    );
  },
);

Title.displayName = "Title";

export { Title };
