import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import "@/app/admin-user-detail.css";
import "@/app/payment-status-timeline.css";
import { prisma } from "@/lib/prisma";
import { AUDIT_ENTITY, PAYMENT_STATUS } from "@/lib/constants";
import { getAdminRole } from "@/lib/admin-session";
import { canVerifyPayment } from "@/lib/auth-routes";
import { serializeRejectionHistory } from "@/lib/payment-rejection-history";
import { AuditLogList } from "@/components/admin/AuditLogList";
import { PaymentReviewPanel } from "@/components/admin/admin-dynamic";
import { PaymentStatusBadge } from "@/components/admin/StatusBadges";
import { Button } from "@/components/ui/button";
import { adminNavLabel } from "@/lib/admin-navigation";
import { IntlBadge } from "@/components/admin/IntlBadge";
import {
  displayCountry,
  isInternationalParticipant,
} from "@/lib/participant-country";
import { formatRegistrationFee } from "@/lib/payment-settings";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    select: { user: { select: { firstName: true, lastName: true } } },
  });
  return {
    title: payment
      ? `${payment.user.firstName} ${payment.user.lastName} — ${adminNavLabel("payments")}`
      : adminNavLabel("payments"),
  };
}

export default async function AdminPaymentDetailPage({ params }: PageProps) {
  const { id } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          country: true,
          nationality: true,
          unit: { select: { unitName: true } },
        },
      },
    },
  });

  if (!payment) {
    notFound();
  }

  const viewerRole = await getAdminRole();
  const canDecide = canVerifyPayment(viewerRole);

  // Opening the proof for review marks it "under review" — but only when the
  // viewer is the MT (the role that actually performs the verification).
  if (canDecide && payment.status === PAYMENT_STATUS.SUBMITTED) {
    await prisma.payment.update({
      where: { id },
      data: { status: PAYMENT_STATUS.UNDER_REVIEW },
    });
    await prisma.user.update({
      where: { id: payment.userId },
      data: { paymentStatus: PAYMENT_STATUS.UNDER_REVIEW },
    });
    payment.status = PAYMENT_STATUS.UNDER_REVIEW;
  }

  const [auditLogs, rejectionHistoryRows] = await Promise.all([
    prisma.auditLog.findMany({
      where: { entityType: AUDIT_ENTITY.PAYMENT, entityId: id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        actor: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.paymentRejectionHistory.findMany({
      where: { paymentId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const rejectionHistory = serializeRejectionHistory(rejectionHistoryRows);

  const serialized = {
    ...payment,
    amount: payment.amount.toString(),
    paymentDate: payment.paymentDate?.toISOString() ?? null,
    proofUploadedAt: payment.proofUploadedAt?.toISOString() ?? null,
    createdAt: payment.createdAt.toISOString(),
  };

  return (
    <div className="admin-user-detail-page">
      <header className="admin-user-detail-hero">
        <div className="admin-user-detail-hero-main">
          <Link href="/admin/payments" className="admin-user-detail-back">
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            Back to payment verification
          </Link>
          <h1 className="admin-user-detail-name">
            {payment.user.firstName} {payment.user.lastName}
            {isInternationalParticipant(payment.user.country) ? (
              <IntlBadge />
            ) : null}
          </h1>
          <p className="admin-user-detail-email">{payment.user.email}</p>
          <p className="admin-user-detail-subline">
            {payment.user.unit?.unitName ?? "No unit"} ·{" "}
            {formatRegistrationFee(payment.amount)}
          </p>
          <p className="admin-user-detail-subline">
            Country of application: {displayCountry(payment.user.country)}
            {isInternationalParticipant(payment.user.country)
              ? ` · Nationality: ${payment.user.nationality?.trim() || "—"}`
              : ""}
          </p>
          <div className="admin-user-detail-badges">
            <PaymentStatusBadge status={payment.status} />
          </div>
        </div>
        <div className="admin-user-detail-hero-actions">
          <Link href={`/admin/users/${payment.user.id}`}>
            <Button size="sm" variant="adminOutline">
              View application
            </Button>
          </Link>
        </div>
      </header>

      {!canDecide ? (
        <div className="portal-alert-info mb-4 rounded-lg px-4 py-3 text-sm">
          Payment verification is performed exclusively by the MT (Management
          Team). Your role has view-only access to the verification status.
        </div>
      ) : null}

      <PaymentReviewPanel
        payment={serialized}
        rejectionHistory={rejectionHistory}
        canDecide={canDecide}
      />

      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-header">
          <h3 className="admin-user-detail-card-title">Payment activity</h3>
        </div>
        <div className="admin-user-detail-card-body">
          <AuditLogList logs={auditLogs} />
        </div>
      </section>
    </div>
  );
}
