import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

import { formatDateShort } from "@/lib/utils";
import type { ParticipantJourneyStage } from "@/lib/participant-journey";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  stage: ParticipantJourneyStage;
  rejectionReason: string | null;
  approvedAt: Date | null;
  canAccessPayment: boolean;
  paymentComplete: boolean;
  exerciseDates?: string | null;
  t: Dictionary["statusBar"];
  locale: Locale;
};

/**
 * Compact, prominent status header for the participant dashboard. Surfaces the
 * application status and a single primary "Go to payment submission" action.
 */
export function DashboardStatusBar({
  stage,
  rejectionReason,
  approvedAt,
  canAccessPayment,
  paymentComplete,
  exerciseDates,
  t,
  locale,
}: Props) {
  let variant = "";
  let Icon: LucideIcon = Clock;
  let title = t.underReviewTitle;
  let text = t.underReviewText;

  if (stage === 3) {
    variant = "pp-status--confirmed";
    Icon = CheckCircle2;
    title = t.confirmedTitle;
    text = exerciseDates
      ? t.confirmedTextWithDates(exerciseDates)
      : t.confirmedText;
  } else if (stage === 2) {
    variant = "pp-status--approved";
    Icon = CreditCard;
    title = t.approvedTitle;
    text = t.approvedText;
  } else if (rejectionReason) {
    variant = "pp-status--attention";
    Icon = AlertTriangle;
    title = t.returnedTitle;
    text = rejectionReason;
  }

  const showPayButton = canAccessPayment && !paymentComplete;

  return (
    <section className={`pp-status ${variant}`.trim()}>
      <div className="pp-status__main">
        <span className="pp-status__icon" aria-hidden>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="pp-status__title">{title}</h2>
          <p className="pp-status__text">{text}</p>
          {approvedAt && stage >= 2 ? (
            <p className="pp-status__meta">
              {t.approvedOn(formatDateShort(approvedAt, locale))}
            </p>
          ) : null}
        </div>
      </div>

      {showPayButton ? (
        <Link href="/event/payment" className="pp-btn pp-btn--primary">
          <CreditCard className="h-4 w-4" aria-hidden />
          {t.goToPayment}
        </Link>
      ) : paymentComplete ? (
        <span className="pp-status__verified">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {t.paymentVerified}
        </span>
      ) : null}
    </section>
  );
}
