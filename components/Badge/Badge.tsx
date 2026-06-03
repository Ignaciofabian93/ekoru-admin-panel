import clsx from "clsx";

type Tone = "neutral" | "success" | "danger" | "warning" | "info" | "primary";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-background-tertiary text-foreground-secondary",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/15 text-[#92690a]",
  info: "bg-info/10 text-info",
  primary: "bg-primary-light-bg text-primary-active",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
