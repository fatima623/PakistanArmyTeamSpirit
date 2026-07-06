import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import {
  ApplicationStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadges";
import {
  applicationStatusSummary,
  paymentStatusSummary,
} from "@/lib/user-status";
import { APPLICATION_STATUS } from "@/lib/constants";
import { PaymentStatusTimeline } from "@/components/payments/PaymentStatusTimeline";
import type { PaymentRejectionHistoryEntry } from "@/lib/payment-rejection-history";
import type { ParticipantJourneyStage } from "@/lib/participant-journey";
import "@/app/payment-status-timeline.css";
import { formatDateShort } from "@/lib/utils";

type Props = {
  /** When omitted, renders the legacy combined status card (e.g. payment page). */
  journeyStage?: ParticipantJourneyStage;
  applicationStatus: string;
  paymentStatus: string;
  rejectionReason: string | null;
  paymentRejectionHistory?: PaymentRejectionHistoryEntry[];
  approvedAt: Date | null;
  rejectedAt: Date | null;
  canAccessPayment: boolean;
  exerciseDates?: string | null;
  latestPayment?: {
    transactionReference: string | null;
    verifiedAt: Date | null;
    amount: { toString(): string };
    currency: string;
  } | null;
};

export function RegistrationStatusCard({
  journeyStage,
  applicationStatus,
  paymentStatus,
  rejectionReason,
  paymentRejectionHistory = [],
  approvedAt,
  rejectedAt,
  canAccessPayment,
  exerciseDates,
  latestPayment,
}: Props) {
  const applicationApproved =
    applicationStatus === APPLICATION_STATUS.APPROVED;

  if (journeyStage === undefined) {
    return (
      <section className="mb-6 space-y-4">
        <h2 className="participant-dash-section-title">Your status</h2>

        <div className="portal-card-accent-amber pats-panel">
          <p className="portal-subtitle mb-2">Application review</p>
          <div className="mb-3">
            <ApplicationStatusBadge
              status={applicationStatus}
              variant="participant"
            />
          </div>
          <p className="portal-muted">{applicationStatusSummary(applicationStatus)}</p>
          {rejectionReason && (
            <p className="portal-alert-error mt-3 text-sm">
              <strong className="text-cp-ink">Reason:</strong> {rejectionReason}
            </p>
          )}
          {approvedAt && applicationApproved && (
            <p className="portal-muted mt-2 text-xs">
              Application approved {formatDateShort(approvedAt)}
            </p>
          )}
          {rejectedAt && (
            <p className="portal-muted mt-2 text-xs">
              Application rejected {formatDateShort(rejectedAt)}
            </p>
          )}
        </div>

        {applicationApproved && (
          <div className="portal-card-accent-sky pats-panel">
            <p className="portal-subtitle mb-2">Payment verification</p>
            <p className="portal-muted mb-3 text-xs">
              Separate from application approval — PATS will manually verify your
              payment proof.
            </p>
            <div className="mb-3">
              <PaymentStatusBadge status={paymentStatus} variant="participant" />
            </div>
            <p className="portal-muted">{paymentStatusSummary(paymentStatus)}</p>
            <PaymentStatusTimeline
              status={paymentStatus}
              history={paymentRejectionHistory}
            />
            {canAccessPayment && (
              <p className="mt-4">
                <Link href="/event/payment" className="portal-link text-base">
                  Go to payment submission →
                </Link>
              </p>
            )}
          </div>
        )}
      </section>
    );
  }

  if (journeyStage === 3) {
    return (
      <section className="mb-6 space-y-4">
        <h2 className="participant-dash-section-title">Your status</h2>
        <div className="portal-journey-banner portal-journey-banner--confirmed pats-panel">
          <p className="mb-2 flex items-center gap-2 text-base font-bold">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-700" aria-hidden />
            Confirmed — You Are Cleared for PATS 2026
          </p>
          <p className="portal-body text-sm">
            Your payment has been verified. Your participation is fully confirmed.
            Report details and coordination instructions will be shared closer to
            the event date.
          </p>
          {exerciseDates ? (
            <p className="portal-muted mt-3 text-xs">Scheduled: {exerciseDates}</p>
          ) : null}
        </div>
        {latestPayment ? (
          <div className="portal-card pats-panel">
            <p className="portal-subtitle mb-3">Payment confirmation</p>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="portal-subtitle text-[11px]">Status</dt>
                <dd className="mt-1">
                  <PaymentStatusBadge status={paymentStatus} variant="participant" />
                </dd>
              </div>
              {latestPayment.transactionReference ? (
                <div>
                  <dt className="portal-subtitle text-[11px]">Reference</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold text-cp-ink">
                    {latestPayment.transactionReference}
                  </dd>
                </div>
              ) : null}
              {latestPayment.verifiedAt ? (
                <div>
                  <dt className="portal-subtitle text-[11px]">Verified on</dt>
                  <dd className="mt-1 text-cp-ink">
                    {formatDateShort(latestPayment.verifiedAt)}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="portal-subtitle text-[11px]">Amount</dt>
                <dd className="mt-1 font-semibold text-cp-ink">
                  {latestPayment.currency} {latestPayment.amount.toString()}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </section>
    );
  }

  if (journeyStage === 1) {
    return (
      <section className="mb-6 space-y-4">
        <h2 className="participant-dash-section-title">Your status</h2>
        <div className="portal-card-accent-amber pats-panel">
          <p className="portal-subtitle mb-2">Registration Submitted — Awaiting Review</p>
          <p className="portal-body">
            Your registration is under review by the PATS administration. You
            will be notified by email once your participation is approved.
          </p>
          {rejectionReason ? (
            <p className="portal-alert-error mt-3 text-sm">
              <strong className="text-cp-ink">Returned for correction:</strong>{" "}
              {rejectionReason}
            </p>
          ) : null}
          {rejectedAt && (
            <p className="portal-muted mt-2 text-xs">
              Returned {formatDateShort(rejectedAt)}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6 space-y-4">
      <h2 className="portal-section-title text-lg">Your status</h2>

      <div className="portal-journey-banner portal-journey-banner--approved pats-panel">
        <p className="mb-1 text-base font-bold">Approved — Payment Required</p>
        <p className="portal-body text-sm">
          Your participation has been approved. Please complete your payment to
          confirm your place in the competition.
        </p>
        {approvedAt ? (
          <p className="portal-muted mt-2 text-xs">
            Approved {formatDateShort(approvedAt)}
          </p>
        ) : null}
      </div>

      <div className="portal-card-accent-amber pats-panel">
        <p className="portal-subtitle mb-2">Application review</p>
        <div className="mb-3">
          <ApplicationStatusBadge
            status={applicationStatus}
            variant="participant"
          />
        </div>
        <p className="portal-muted">{applicationStatusSummary(applicationStatus)}</p>
      </div>

      {applicationApproved && (
        <div className="portal-card-accent-sky pats-panel">
          <p className="portal-subtitle mb-2">Payment verification</p>
          <p className="portal-muted mb-3 text-xs">
            Separate from application approval — PATS will manually verify your
            payment proof.
          </p>
          <div className="mb-3">
            <PaymentStatusBadge status={paymentStatus} variant="participant" />
          </div>
          <p className="portal-muted">{paymentStatusSummary(paymentStatus)}</p>
          <PaymentStatusTimeline
            status={paymentStatus}
            history={paymentRejectionHistory}
          />
          {canAccessPayment && (
            <p className="mt-4">
              <Link href="/event/payment" className="portal-link text-base">
                Go to payment submission →
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
