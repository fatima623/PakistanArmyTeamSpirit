import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

import { formatDateShort } from "@/lib/utils";
import type { RegistrationOverallStage } from "@/lib/participant-workflow";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  stage: RegistrationOverallStage;
  rejectionReason: string | null;
  approvedAt: Date | null;
  /** Journey URL for the step the participant should act on next, if any. */
  nextStepHref: string | null;
  exerciseDates?: string | null;
  t: Dictionary["statusBar"];
  locale: Locale;
};

export function DashboardStatusBar({
  stage,
  rejectionReason,
  approvedAt,
  nextStepHref,
  exerciseDates,
  t,
  locale,
}: Props) {
  let variant = "";
  let Icon: LucideIcon = ListChecks;
  let title = t.inProgressTitle;
  let text = t.inProgressText;

  if (stage === "approved") {
    variant = "pp-status--confirmed";
    Icon = CheckCircle2;
    title = t.confirmedTitle;
    text = exerciseDates
      ? t.confirmedTextWithDates(exerciseDates)
      : t.confirmedText;
  } else if (stage === "returned") {
    variant = "pp-status--attention";
    Icon = AlertTriangle;
    title = t.returnedTitle;
    text = rejectionReason ?? t.inProgressText;
  } else if (stage === "underReview") {
    variant = "pp-status--approved";
    Icon = Clock;
    title = t.underReviewTitle;
    text = t.underReviewText;
  }

  const showContinue = stage !== "approved" && !!nextStepHref;

  return (
    <section className={`pp-status ${variant}`.trim()}>
      <div className="pp-status__main">
        <span className="pp-status__icon" aria-hidden>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="pp-status__title">{title}</h2>
          <p className="pp-status__text">{text}</p>
          {approvedAt && stage === "approved" ? (
            <p className="pp-status__meta">
              {t.approvedOn(formatDateShort(approvedAt, locale))}
            </p>
          ) : null}
        </div>
      </div>

      {showContinue ? (
        <Link href={nextStepHref} className="pp-btn pp-btn--primary">
          {t.continueRegistration}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </section>
  );
}
