import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Activity, FileText, Mail } from "lucide-react";

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
    <div className="flex w-full flex-col gap-4 pb-[5.5rem] lg:pb-6">
      <Link href="/admin/payments" className="inline-flex items-center self-start text-[0.8125rem] font-medium text-slate-500 no-underline transition-colors hover:text-green-700">
        <ArrowLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden />
        Back to payment verification
      </Link>

      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <span className="inline-flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-olive-dark to-brand-olive text-[1.05rem] font-bold tracking-[0.02em] text-white" aria-hidden>
          {initials}
        </span>
        <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-[3px]">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold leading-tight tracking-[-0.01em] text-slate-900">
            {payment.user.firstName} {payment.user.lastName}
            {isInternationalParticipant(payment.user.country) ? (
              <IntlBadge />
            ) : null}
          </h1>
          <p className="truncate text-[0.8125rem] text-slate-500">{payment.user.email}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[0.8125rem] text-slate-600">
            <span>{payment.user.unit?.unitName ?? "No unit"}</span>
            <span className="h-[3px] w-[3px] rounded-full bg-slate-300" aria-hidden />
            <span className="font-bold text-slate-900">
              {formatRegistrationFee(payment.amount)}
            </span>
            <span className="h-[3px] w-[3px] rounded-full bg-slate-300" aria-hidden />
            <span>Submitted {formatDateShort(payment.createdAt)}</span>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <PaymentStatusBadge status={payment.status} />
          <Link href={`/admin/users/${payment.user.id}`}>
            <Button size="sm" variant="adminOutline">
              View application
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_336px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
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

        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20 [&_.admin-timeline]:max-h-[calc(100vh-220px)] [&_.admin-timeline]:min-h-[280px]">
          <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden transition-[box-shadow,transform] duration-200">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:text-green-700">
                <Activity className="h-4 w-4" aria-hidden />
                Activity timeline
              </h3>
            </div>
            <div className="p-[18px]">
              <AuditLogList logs={auditLogs} />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden transition-[box-shadow,transform] duration-200">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:text-green-700">Quick actions</h3>
            </div>
            <div className="p-[18px]">
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
