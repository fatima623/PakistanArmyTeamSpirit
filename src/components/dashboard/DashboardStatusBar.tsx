import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/utils";
import type { ParticipantJourneyStage } from "@/lib/participant-journey";

type Props = {
  stage: ParticipantJourneyStage;
  rejectionReason: string | null;
  approvedAt: Date | null;
  canAccessPayment: boolean;
  paymentComplete: boolean;
  exerciseDates?: string | null;
};

/**
 * Compact, prominent status header for the participant dashboard. Surfaces the
 * application status and a single primary "Go to payment submission" action at
 * the very top, replacing the verbose status + payment-verification stack.
 */
export function DashboardStatusBar({
  stage,
  rejectionReason,
  approvedAt,
  canAccessPayment,
  paymentComplete,
  exerciseDates,
}: Props) {
  let variant: "review" | "approved" | "confirmed" = "review";
  let Icon: LucideIcon = Clock;
  let title = "Application under review";
  let text =
    "Your registration is being reviewed by PATS. We'll email you as soon as it's approved.";

  if (stage === 3) {
    variant = "confirmed";
    Icon = CheckCircle2;
    title = "Confirmed — you're cleared for PATS 2026";
    text = exerciseDates
      ? `Your payment is verified and your place is confirmed. Scheduled: ${exerciseDates}.`
      : "Your payment is verified and your place is confirmed.";
  } else if (stage === 2) {
    variant = "approved";
    Icon = CreditCard;
    title = "Approved — payment required";
    text =
      "Your application is approved. Complete your payment to secure your place in the competition.";
  } else if (rejectionReason) {
    Icon = AlertTriangle;
    title = "Returned for correction";
    text = rejectionReason;
  }

  const showPayButton = canAccessPayment && !paymentComplete;

  return (
    <section className={`dashboard-status dashboard-status--${variant}`}>
      <div className="dashboard-status__main">
        <span className="dashboard-status__icon" aria-hidden>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="dashboard-status__title">{title}</h2>
          <p className="dashboard-status__text">{text}</p>
          {approvedAt && stage >= 2 ? (
            <p className="dashboard-status__meta">
              Approved {formatDateShort(approvedAt)}
            </p>
          ) : null}
        </div>
      </div>

      {showPayButton ? (
        <Button asChild className="dashboard-status__cta">
          <Link href="/event/payment">
            <CreditCard className="mr-2 h-4 w-4" aria-hidden />
            Go to payment submission
          </Link>
        </Button>
      ) : paymentComplete ? (
        <span className="dashboard-status__verified">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Payment verified
        </span>
      ) : null}
    </section>
  );
}
