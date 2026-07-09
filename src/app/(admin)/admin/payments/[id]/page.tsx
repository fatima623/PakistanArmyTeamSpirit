import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Activity, FileText, Mail } from "lucide-react";

import "@/app/admin-user-detail.css";
import "@/app/payment-status-timeline.css";
import "@/app/admin-payment-detail.css";
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
import { isInternationalParticipant } from "@/lib/participant-country";
import { formatRegistrationFee } from "@/lib/payment-settings";
import { formatDateShort } from "@/lib/utils";

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

  const initials =
    `${payment.user.firstName?.[0] ?? ""}${payment.user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "–";

  return (
    <div className="admin-pay-page">
      <Link href="/admin/payments" className="admin-pay-back">
        <ArrowLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden />
        Back to payment verification
      </Link>

      <section className="admin-pay-summary">
        <span className="admin-pay-summary__avatar" aria-hidden>
          {initials}
        </span>
        <div className="admin-pay-summary__id">
          <h1 className="admin-pay-summary__name">
            {payment.user.firstName} {payment.user.lastName}
            {isInternationalParticipant(payment.user.country) ? (
              <IntlBadge />
            ) : null}
          </h1>
          <p className="admin-pay-summary__email">{payment.user.email}</p>
          <div className="admin-pay-summary__meta">
            <span>{payment.user.unit?.unitName ?? "No unit"}</span>
            <span className="admin-pay-summary__meta-dot" aria-hidden />
            <span className="admin-pay-summary__amount">
              {formatRegistrationFee(payment.amount)}
            </span>
            <span className="admin-pay-summary__meta-dot" aria-hidden />
            <span>Submitted {formatDateShort(payment.createdAt)}</span>
          </div>
        </div>
        <div className="admin-pay-summary__right">
          <PaymentStatusBadge status={payment.status} />
          <Link href={`/admin/users/${payment.user.id}`}>
            <Button size="sm" variant="adminOutline">
              View application
            </Button>
          </Link>
        </div>
      </section>

      <div className="admin-pay-layout">
        <div className="admin-pay-main">
          {!canDecide ? (
            <div className="portal-alert-info rounded-lg px-4 py-2.5 text-[13px]">
              Payment verification is performed exclusively by the MT (Management
              Team). Your role has view-only access.
            </div>
          ) : null}

          <PaymentReviewPanel
            payment={serialized}
            rejectionHistory={rejectionHistory}
            canDecide={canDecide}
          />
        </div>

        <aside className="admin-pay-aside">
          <section className="admin-pay-card">
            <div className="admin-pay-card__header">
              <h3 className="admin-pay-card__title">
                <Activity className="h-4 w-4" aria-hidden />
                Activity timeline
              </h3>
            </div>
            <div className="admin-pay-card__body">
              <AuditLogList logs={auditLogs} />
            </div>
          </section>

          <section className="admin-pay-card">
            <div className="admin-pay-card__header">
              <h3 className="admin-pay-card__title">Quick actions</h3>
            </div>
            <div className="admin-pay-card__body">
              <div className="flex flex-col gap-2">
                <Button variant="adminOutline" className="justify-start" asChild>
                  <Link href={`/admin/users/${payment.user.id}`}>
                    <FileText className="mr-2 h-4 w-4" aria-hidden />
                    View full application
                  </Link>
                </Button>
                <Button variant="adminOutline" className="justify-start" asChild>
                  <a href={`mailto:${payment.user.email}`}>
                    <Mail className="mr-2 h-4 w-4" aria-hidden />
                    Email participant
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
