import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

/**
 * Section heading for /familiarization.
 *
 * Deliberately NOT `PatsSectionHeading`: the site-wide heading is locked to the
 * gold/olive accent by `!important` light-theme rules in globals.css, and this
 * page runs on the blue-and-white palette. Keeping a local heading gives the
 * page its own accent without adding another `!important` to the stylesheet
 * (see scripts/css-guardrails.mjs — the count only ratchets down).
 */
export function FamiliarizationHeading({
  eyebrow,
  title,
  description,
  className,
}: Props) {
  return (
    <div className={cn("fam-heading", className)}>
      <p className="fam-eyebrow">{eyebrow}</p>
      <div className="fam-rule" aria-hidden />
      <h2 className="fam-title">{title}</h2>
      {description && <p className="fam-lede">{description}</p>}
    </div>
  );
}
