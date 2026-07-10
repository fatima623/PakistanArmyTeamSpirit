import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { Eye } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { PaymentStatusBadge } from "@/components/admin/StatusBadges";
import { Button } from "@/components/ui/button";
import { LiveSearchInput } from "@/components/admin/LiveSearchInput";
import {
  adminPaymentsControls,
  adminPaymentsFilterTabs,
  adminPaymentsPage,
  adminPaymentsPanel,
  adminPaymentsToolbarSearch,
  filterChipClasses,
} from "@/lib/admin-ui";
import {
  PAYMENT_STATUS,
  PAYMENT_STATUS_FILTER_LABELS,
  LEGACY_PAYMENT_STATUS,
} from "@/lib/constants";
import { adminNavLabel } from "@/lib/admin-navigation";
import { IntlBadge } from "@/components/admin/IntlBadge";
import {
  formatAdminTableCountry,
  isInternationalParticipant,
} from "@/lib/participant-country";
import { formatRegistrationFee } from "@/lib/payment-settings";

export const metadata: Metadata = {
  title: adminNavLabel("payments"),
};

type SearchParams = Promise<{ status?: string; search?: string }>;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const search = params.search ?? "";

  const where: Prisma.PaymentWhereInput = {};
  if (status === PAYMENT_STATUS.SUBMITTED) {
    where.status = {
      in: [PAYMENT_STATUS.SUBMITTED, PAYMENT_STATUS.UNDER_REVIEW],
    };
  } else if (status === PAYMENT_STATUS.UNDER_REVIEW) {
    where.status = PAYMENT_STATUS.UNDER_REVIEW;
  } else if (status === PAYMENT_STATUS.VERIFIED) {
    where.status = {
      in: [PAYMENT_STATUS.VERIFIED, LEGACY_PAYMENT_STATUS.APPROVED],
    };
  } else if (status !== "all") {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { transactionReference: { contains: search } },
      {
        user: {
          OR: [
            { email: { contains: search } },
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        },
      },
    ];
  }

  const filters = [
    "all",
    PAYMENT_STATUS.SUBMITTED,
    PAYMENT_STATUS.UNDER_REVIEW,
    PAYMENT_STATUS.VERIFIED,
    PAYMENT_STATUS.REJECTED,
    PAYMENT_STATUS.RETURNED,
  ] as const;

  const [payments, totalCount] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            applicationStatus: true,
            country: true,
            nationality: true,
            unit: { select: { unitName: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return (
    <div className={adminPaymentsPage}>
      <div className={adminPaymentsPanel}>
  

      

        <section className={adminPaymentsControls}>
          <div className={adminPaymentsToolbarSearch}>
            <LiveSearchInput
              paramName="search"
              placeholder="Search reference, name, email..."
              ariaLabel="Search payments"
              className="relative min-w-0"
              inputClassName="h-11 w-full rounded-lg bg-white pl-10 pr-3.5 text-sm text-slate-800 shadow-none placeholder:text-muted-foreground/70 focus-visible:border-brand-olive/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-olive/15 focus-visible:ring-offset-0"
              iconClassName="pointer-events-none absolute left-3.5 top-1/2 z-[1] h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-muted-foreground/70"
            />
          </div>
          <nav
            className={adminPaymentsFilterTabs}
            aria-label="Filter payments"
          >
            {filters.map((f) => (
              <Link
                key={f}
                href={`/admin/payments?status=${f}&search=${encodeURIComponent(search)}`}
                className={filterChipClasses(f, status === f)}
              >
                {PAYMENT_STATUS_FILTER_LABELS[f] ?? f}
              </Link>
            ))}
          </nav>
        </section>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="admin-data-table min-w-[44rem]">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="!text-left">Participant</th>
                <th scope="col">Unit</th>
                <th scope="col">Amount</th>
                <th scope="col" className="!text-left">Reference</th>
                <th scope="col">Payment</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-600">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const country = formatAdminTableCountry(
                    p.user.country,
                    p.user.nationality
                  );
                  return (
                    <tr key={p.id}>
                      <td className="admin-users-cell-participant">
                        <div className="admin-users-participant">
                          <span className="admin-users-avatar" aria-hidden>
                            {`${p.user.firstName?.[0] ?? ""}${p.user.lastName?.[0] ?? ""}`.toUpperCase()}
                          </span>
                          <div className="admin-users-participant-text">
                            <div className="admin-users-participant-name">
                              {p.user.firstName} {p.user.lastName}
                              {isInternationalParticipant(p.user.country) ? (
                                <IntlBadge />
                              ) : null}
                            </div>
                            <div className="admin-users-participant-sub">
                              {p.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-slate-600">
                        <div className="admin-users-unit-name">
                          {p.user.unit?.unitName ?? "—"}
                        </div>
                        {country && country !== "—" ? (
                          <div className="admin-users-unit-sub">{country}</div>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap text-[0.8125rem] text-slate-600">
                        {formatRegistrationFee(p.amount)}
                      </td>
                      <td className="!text-left break-all font-mono text-[0.8125rem] text-slate-900">
                        {p.transactionReference ?? "—"}
                      </td>
                      <td className="!overflow-visible !px-1.5">
                        <div className="flex w-full min-w-0 items-center justify-center">
                          <PaymentStatusBadge
                            status={p.status}
                            showPrefix={false}
                            density="table"
                          />
                        </div>
                        <div className="admin-users-app-date">
                          {formatDateShort(p.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="admin-table-actions admin-table-actions--center">
                          <Button
                            size="sm"
                            variant="adminOutline"
                            className="portal-table-action-btn portal-table-action-btn--icon"
                            asChild
                          >
                            <Link
                              href={`/admin/payments/${p.id}`}
                              aria-label="Review payment"
                              title="Review payment"
                            >
                              <Eye className="h-4 w-4" aria-hidden />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
