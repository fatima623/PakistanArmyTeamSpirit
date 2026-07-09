import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { APPLICATION_STATUS, isPaymentVerified } from "@/lib/constants";
import { getParticipantPaymentData } from "@/lib/participant-payment-data";
import { getDeadlines, paymentClosedByDeadline } from "@/lib/deadlines";
import { PaymentSubmissionForm } from "@/components/dashboard/PaymentSubmissionForm";
import { PatsPortalHeader } from "@/components/pats/PatsPortalHeader";

export const metadata: Metadata = {
  title: "Payment",
};

export default async function PaymentPage() {
  const session = await requireConfirmedParticipant();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      approved: true,
      applicationStatus: true,
      paymentStatus: true,
      rejectionReason: true,
      approvedAt: true,
      rejectedAt: true,
      suspended: true,
    },
  });

  if (!user) {
    redirect("/event/login");
  }

  if (user.suspended) {
    return (
      <div className="portal-form-card pats-panel">
        <PatsPortalHeader title="Payment" />
        <p className="portal-body">
          Your account has been suspended. Contact PATS administration for assistance.
        </p>
        <Link href="/event/dashboard" className="portal-link mt-4 inline-block">
          Return to dashboard
        </Link>
      </div>
    );
  }

  const approved =
    (user.applicationStatus === APPLICATION_STATUS.APPROVED || user.approved) &&
    !user.suspended;
  // Fetch payment data for every approved participant — including those whose
  // payment is already verified, so the form can render its read-only
  // "payment verified" receipt view instead of a blank page.
  const paymentData = approved
    ? await getParticipantPaymentData(session.user.id)
    : null;
  const deadlinePassed =
    !isPaymentVerified(user.paymentStatus) &&
    paymentClosedByDeadline(await getDeadlines());

  return (
    <div className="space-y-6">
      {!approved ? (
        <div className="portal-form-card pats-panel">
          <PatsPortalHeader title="Payment" />
          <p className="portal-body mb-4">
            Payment is available after your application has been approved by PATS.
            You can track your status on the dashboard.
          </p>
          <Link href="/event/dashboard" className="portal-link">
            Return to dashboard
          </Link>
        </div>
      ) : deadlinePassed ? (
        <div className="portal-form-card pats-panel">
          <PatsPortalHeader title="Payment" />
          <p className="portal-body mb-4">
            The payment deadline has passed, so new payment submissions are
            closed. Please contact PATS administration if you still need to
            complete your payment.
          </p>
          <Link href="/event/dashboard" className="portal-link">
            Return to dashboard
          </Link>
        </div>
      ) : paymentData ? (
        <div className="space-y-6">
          <PatsPortalHeader
            title="Payment"
            subtitle={
              isPaymentVerified(user.paymentStatus)
                ? "Your registration payment has been verified by PATS — no further action is required."
                : "Send the registration fee using the methods below, then upload your proof for PATS verification."
            }
          />
          <PaymentSubmissionForm initialData={paymentData} />
        </div>
      ) : (
        <div className="portal-form-card pats-panel">
          <PatsPortalHeader title="Payment" />
          <p className="portal-body mb-4">
            No payment information is available for your account yet. Please
            return to the dashboard and try again shortly.
          </p>
          <Link href="/event/dashboard" className="portal-link">
            Return to dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
