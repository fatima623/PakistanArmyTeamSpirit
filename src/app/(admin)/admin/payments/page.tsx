import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { Eye } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDateShort, cn } from "@/lib/utils";
import { PaymentStatusBadge } from "@/components/admin/StatusBadges";
import { Button } from "@/components/ui/button";
import { LiveSearchInput } from "@/components/admin/LiveSearchInput";
import {
  adminFilterChip,
  adminFilterChipActive,
  adminFilterChipInactive,
  adminPaymentsControls,
  adminPaymentsFilterTabs,
  adminPaymentsPage,
  adminPaymentsPanel,
  adminPaymentsToolbarSearch,
  filterChipToneProps,
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
import "@/app/admin-payments-reference.css";

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
        <div className="admin-payments-alert">
          <strong>Manual verification only.</strong> Participant uploads are not
          auto-approved. Review proof, then verify or reject each payment.
        </div>

        <header className="admin-payments-page-header">
          <div className="admin-payments-page-intro">
            <p className="admin-payments-page-desc">
              Review uploaded payment proofs and update verification status.
            </p>
            <span className="admin-payments-count-badge">
              {totalCount} {totalCount === 1 ? "payment" : "payments"}
            </span>
          </div>
        </header>

        <section className={adminPaymentsControls}>
          <div className={adminPaymentsToolbarSearch}>
            <LiveSearchInput
              paramName="search"
              placeholder="Search reference, name, email..."
              ariaLabel="Search payments"
              className="admin-payments-search-field"
              inputClassName="admin-input admin-payments-search-input"
              iconClassName="admin-payments-search-icon"
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
                {...filterChipToneProps(f)}
                className={cn(
                  adminFilterChip,
                  status === f ? adminFilterChipActive : adminFilterChipInactive
                )}
              >
                {PAYMENT_STATUS_FILTER_LABELS[f] ?? f}
              </Link>
            ))}
          </nav>
        </section>

        <div className="admin-payments-table-shell">
          <table className="admin-payments-table admin-users-table">
            <colgroup>
              <col className="admin-users-col-participant" />
              <col className="admin-payments-col-unit" />
              <col className="admin-payments-col-amount" />
              <col className="admin-payments-col-ref" />
              <col className="admin-payments-col-pay-status" />
              <col className="admin-users-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Participant</th>
                <th scope="col">Unit</th>
                <th scope="col">Amount</th>
                <th scope="col">Reference</th>
                <th scope="col">Payment</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-payments-empty">
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
                      <td className="admin-payments-cell-muted">
                        <div className="admin-users-unit-name">
                          {p.user.unit?.unitName ?? "—"}
                        </div>
                        {country && country !== "—" ? (
                          <div className="admin-users-unit-sub">{country}</div>
                        ) : null}
                      </td>
                      <td className="admin-payments-cell-amount">
                        {formatRegistrationFee(p.amount)}
                      </td>
                      <td className="admin-payments-cell-ref">
                        {p.transactionReference ?? "—"}
                      </td>
                      <td className="admin-payments-cell-badge">
                        <div className="admin-payments-badge-wrap">
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
                      <td className="admin-payments-cell-actions">
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
