import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { PaymentInstructions } from "@/components/dashboard/PaymentInstructions";
import { ParticipantRegistrationDetailsCard } from "@/components/dashboard/ParticipantRegistrationDetailsCard";
import { PaymentStatusTimeline } from "@/components/payments/PaymentStatusTimeline";
import { PaymentStatusBadge } from "@/components/admin/StatusBadges";
import {
  APPLICATION_STATUS,
  PAYMENT_STATUS,
  isPaymentAwaitingVerification,
} from "@/lib/constants";
import { resolveParticipantJourneyStage } from "@/lib/participant-journey";
import type { PaymentSettingsPublic } from "@/lib/payment-settings";
import type { PaymentRejectionHistoryEntry } from "@/lib/payment-rejection-history";
import { formatDateShort } from "@/lib/utils";
import "@/app/payment-status-timeline.css";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  rank: string;
  createdAt: Date;
  country?: string | null;
  nationality?: string | null;
  applicationStatus: string;
  paymentStatus: string;
  approved: boolean;
  rejectionReason: string | null;
  approvedAt: Date | null;
  unit: {
    unitName: string;
    branch: string;
    bdeOrFmn: string;
  } | null;
  paymentSettings: PaymentSettingsPublic;
  paymentRejectionHistory: PaymentRejectionHistoryEntry[];
  latestPayment: {
    transactionReference: string | null;
    verifiedAt: Date | null;
    amount: { toString(): string };
    currency: string;
  } | null;
  exerciseDates: string | null;
};

export function ParticipantDashboardFlow(props: Props) {
  const stage = resolveParticipantJourneyStage({
    applicationStatus: props.applicationStatus,
    paymentStatus: props.paymentStatus,
    approved: props.approved,
  });

  const fullName = `${props.firstName} ${props.lastName}`.trim();
  const unitLabel = props.unit?.unitName ?? "your unit";

  const registrationCard = (
    <ParticipantRegistrationDetailsCard
      firstName={props.firstName}
      lastName={props.lastName}
      email={props.email}
      rank={props.rank}
      createdAt={props.createdAt}
      country={props.country ?? null}
      nationality={props.nationality ?? null}
      unit={props.unit}
    />
  );

  if (stage === 1) {
    const rejected =
      props.applicationStatus === APPLICATION_STATUS.REJECTED;

    return (
      <div className="space-y-6">
        <section className="portal-card pats-panel">
          <p className="portal-muted mb-1 text-sm">Welcome</p>
          <h2 className="portal-h2 mb-2">
            {fullName}
            <span className="portal-muted ml-2 text-lg font-normal">
              — {unitLabel}
            </span>
          </h2>
        </section>

        <section className="portal-card-accent-amber pats-panel">
          <p className="portal-subtitle mb-2 flex items-center gap-2 text-amber-950">
            Registration Submitted — Awaiting Review
          </p>
          <p className="portal-body text-amber-950">
            Your registration is under review by the PATS administration. You
            will be notified by email once your participation is approved.
          </p>
          {rejected && props.rejectionReason ? (
            <p className="portal-alert-error mt-4 text-sm">
              <strong className="text-cp-ink">Returned for correction:</strong>{" "}
              {props.rejectionReason}
            </p>
          ) : null}
        </section>

        {registrationCard}
      </div>
    );
  }

  if (stage === 2) {
    const paymentPending =
      props.paymentStatus === PAYMENT_STATUS.PENDING ||
      props.paymentStatus === PAYMENT_STATUS.REJECTED ||
      props.paymentStatus === PAYMENT_STATUS.RETURNED;
    const paymentSubmitted = isPaymentAwaitingVerification(props.paymentStatus);

    return (
      <div className="space-y-6">
        <section className="portal-card pats-panel">
          <p className="portal-muted mb-1 text-sm">Welcome back</p>
          <h2 className="portal-h2 mb-2">
            {fullName}
            <span className="portal-muted ml-2 text-lg font-normal">
              — {unitLabel}
            </span>
          </h2>
        </section>

        <section className="portal-alert-success">
          <p className="mb-1 text-base font-bold text-emerald-950">
            Approved — Payment Required
          </p>
          <p className="text-sm leading-relaxed text-emerald-950">
            Your participation has been approved. Please complete your payment
            to confirm your place in the competition.
          </p>
          {props.approvedAt ? (
            <p className="portal-muted mt-2 text-xs text-emerald-900">
              Approved {formatDateShort(props.approvedAt)}
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          {props.exerciseDates ? (
            <div className="portal-alert-warning">
              <p className="mb-1 text-sm font-bold text-cp-ink">Payment deadline</p>
              <p className="text-sm leading-relaxed text-cp-ink-muted">
                Complete your payment before{" "}
                <strong className="text-cp-ink">{props.exerciseDates}</strong> to
                secure your place in the competition.
              </p>
            </div>
          ) : null}
          <PaymentInstructions settings={props.paymentSettings} />
          <div className="portal-card-accent-sky pats-panel">
            <p className="portal-subtitle mb-2">Payment status</p>
            <PaymentStatusBadge
              status={props.paymentStatus}
              variant="participant"
            />
            <PaymentStatusTimeline
              status={props.paymentStatus}
              history={props.paymentRejectionHistory}
            />
            <p className="portal-muted mt-4">
              <Link href="/event/payment" className="portal-link text-base">
                {paymentPending
                  ? "Upload payment proof →"
                  : paymentSubmitted
                    ? "View submitted payment →"
                    : "Go to payment page →"}
              </Link>
            </p>
          </div>
        </section>

        {registrationCard}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="portal-card pats-panel">
        <p className="portal-muted mb-1 text-sm">Welcome back</p>
        <h2 className="portal-h2 mb-2">
          {fullName}
          <span className="portal-muted ml-2 text-lg font-normal">
            — {unitLabel}
          </span>
        </h2>
      </section>

      <section className="portal-alert-success">
        <p className="mb-2 flex items-center gap-2 text-base font-bold text-emerald-950">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-700" aria-hidden />
          Confirmed — You Are Cleared for PATS 2026
        </p>
        <p className="text-sm leading-relaxed text-emerald-950">
          Your payment has been verified. Your participation is fully confirmed.
          Report details and coordination instructions will be shared closer to
          the event date.
        </p>
        {props.exerciseDates ? (
          <p className="portal-muted mt-3 text-xs text-emerald-900">
            Scheduled: {props.exerciseDates}
          </p>
        ) : null}
      </section>

      {registrationCard}

      {props.latestPayment ? (
        <section className="portal-card pats-panel">
          <h2 className="portal-section-title mb-4 border-b border-cp-border pb-3">
            Payment confirmation
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="portal-subtitle text-[11px]">Status</dt>
              <dd className="mt-1">
                <PaymentStatusBadge
                  status={props.paymentStatus}
                  variant="participant"
                />
              </dd>
            </div>
            {props.latestPayment.transactionReference ? (
              <div>
                <dt className="portal-subtitle text-[11px]">Reference</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-cp-ink">
                  {props.latestPayment.transactionReference}
                </dd>
              </div>
            ) : null}
            {props.latestPayment.verifiedAt ? (
              <div>
                <dt className="portal-subtitle text-[11px]">Verified on</dt>
                <dd className="mt-1 text-cp-ink">
                  {formatDateShort(props.latestPayment.verifiedAt)}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="portal-subtitle text-[11px]">Amount</dt>
              <dd className="mt-1 font-semibold text-cp-ink">
                {props.latestPayment.currency}{" "}
                {props.latestPayment.amount.toString()}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  );
}
