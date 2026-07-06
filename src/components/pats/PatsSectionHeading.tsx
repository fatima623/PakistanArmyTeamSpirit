import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  display?: boolean;
  className?: string;
};

export function PatsSectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  display = false,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "pats-section-heading",
        align === "center" && "mx-auto max-w-3xl text-center",
        className
      )}
    >
      <p className="pats-eyebrow">{eyebrow}</p>
      <div
        className={cn("pats-gold-rule", align === "center" && "pats-gold-rule--center")}
        aria-hidden
      />
      <h2
        className={cn(
          "pats-section-title",
          display && "pats-section-title--display"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("pats-body mt-4", align === "center" && "mx-auto max-w-2xl")}>
          {description}
        </p>
      )}
    </div>
  );
}
