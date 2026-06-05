import clsx from "clsx";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  const EKORU_ICON = "/brand/icon.webp";
  const EKORU_LOGO = "/brand/logo.webp";
  return (
    <span className={clsx("inline-flex items-center gap-4", className)}>
      <span className="flex items-center justify-center">
        <Image src={EKORU_ICON} alt="Ekoru icon" width={28} height={28} />
      </span>
      <span className="flex items-center justify-center">
        <Image src={EKORU_LOGO} alt="Ekoru logo" width={80} height={28} />
      </span>
    </span>
  );
}
