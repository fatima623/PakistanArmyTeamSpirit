import Image from "next/image";

import { PATS_CROP } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  src?: string;
  className?: string;
  /** Decorative — empty string keeps image presentational */
  alt?: string;
};

/** Sharp static hero background for inner pages (no video upscale / parallax). */
export function PageHeroBackdrop({
  src = PATS_CROP.pageHeroDefault,
  className,
  alt = "",
}: Props) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-tactical-void",
        className
      )}
      aria-hidden={alt === ""}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        quality={92}
        className="h-full w-full object-fill object-center"
      />
      <div className="cinematic-noise pointer-events-none absolute inset-0 z-[1] opacity-[0.04]" />
    </div>
  );
}
