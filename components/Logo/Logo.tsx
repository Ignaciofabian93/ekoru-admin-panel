import clsx from "clsx";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  const EKORU_LOGO = "/brand/logo.webp";
  return (
    <span className={clsx("inline-flex items-center gap-4", className)}>
      <span className="flex items-center justify-center">
        <Image src={EKORU_LOGO} alt="Ekoru logo" width={120} height={29} />
      </span>
    </span>
  );
}
