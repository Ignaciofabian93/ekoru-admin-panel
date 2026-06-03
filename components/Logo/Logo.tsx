import clsx from "clsx";
import { Leaf } from "lucide-react";

/**
 * Lightweight wordmark for the admin console. Text-based on purpose — the admin
 * panel doesn't ship the marketing brand SVGs that the web app uses.
 */
export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-on-primary">
        <Leaf size={18} strokeWidth={2.25} />
      </span>
      {!compact && (
        <span className="font-sans text-lg font-bold tracking-tight text-foreground">
          Ekoru
          <span className="text-foreground-tertiary"> Admin</span>
        </span>
      )}
    </span>
  );
}
