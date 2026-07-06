import { SectionNavLabel } from "@/components/cinematic/SectionNavLabel";
import { cn } from "@/lib/utils";

type Props = {
  /** Navbar-style section label above the title */
  sectionLabel?: string;
  /** Section id for in-page anchor (e.g. `about` → `#about`) */
  sectionId?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  sectionLabel,
  sectionId,
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: Props) {
  const labelHref = sectionId ? `#${sectionId}` : undefined;

  return (
    <div
      className={cn(
        align === "center" && "mx-auto max-w-3xl text-center",
        className
      )}
    >
      {sectionLabel && (
        <div className={cn("mb-3", align === "center" && "flex justify-center")}>
          <SectionNavLabel label={sectionLabel} href={labelHref} />
        </div>
      )}
      {!sectionLabel && eyebrow && (
        <p className="mb-2 font-condensed text-sm font-bold uppercase tracking-[0.28em] text-tactical-brass sm:text-base">
          {eyebrow}
        </p>
      )}
      <h2 className="cinematic-heading font-display text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="cinematic-body mt-3 font-condensed text-lg leading-relaxed lg:text-xl">
          {description}
        </p>
      )}
      <div className="mt-5 flex items-center gap-3">
        <div className="h-px w-12 bg-gradient-to-r from-tactical-brass to-transparent sm:w-20" />
        <div className="h-1 w-1 rotate-45 bg-tactical-brass/80" aria-hidden />
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-tactical-brass/40 to-transparent" />
      </div>
    </div>
  );
}
