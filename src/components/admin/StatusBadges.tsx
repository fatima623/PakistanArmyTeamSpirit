import { memo, type ReactNode } from "react";
import {
  CheckCircle2,
  Clock,
  CornerUpLeft,
  Hourglass,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TABLE_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TABLE_LABELS,
  normalizePaymentStatus,
  type ApplicationStatus,
  type PaymentStatus,
} from "@/lib/constants";

const badgeBase = "ops-status-badge";
const badgePill = "ops-status-pill";

const applicationStyles: Record<ApplicationStatus, string> = {
  PENDING: "ops-status-pending",
  UNDER_REVIEW: "ops-status-review",
  APPROVED: "ops-status-approved",
  REJECTED: "ops-status-rejected",
  RETURNED: "ops-status-pending",
};

const paymentStyles: Record<PaymentStatus, string> = {
  PENDING: "ops-status-neutral",
  SUBMITTED: "ops-status-review",
  UNDER_REVIEW: "ops-status-review",
  VERIFIED: "ops-status-approved",
  REJECTED: "ops-status-rejected",
  RETURNED: "ops-status-pending",
};

type BadgeVariant = "admin" | "participant";
type BadgeDensity = "default" | "table";

function ApplicationStatusPill({
  label,
  statusKey,
  density,
  className,
}: {
  label: string;
  statusKey: ApplicationStatus;
  density: BadgeDensity;
  className?: string;
}) {
  const isTable = density === "table";

  return (
    <span
      className={cn(
        isTable ? badgePill : badgeBase,
        applicationStyles[statusKey] ?? applicationStyles.PENDING,
        className
      )}
      title={label}
    >
      {label}
    </span>
  );
}

function PaymentStatusPill({
  label,
  fullLabel,
  statusKey,
  density,
  className,
}: {
  label: string;
  fullLabel: string;
  statusKey: PaymentStatus;
  density: BadgeDensity;
  className?: string;
}) {
  const isTable = density === "table";

  return (
    <span
      className={cn(
        isTable ? badgePill : badgeBase,
        paymentStyles[statusKey] ?? paymentStyles.PENDING,
        statusKey === PAYMENT_STATUS.SUBMITTED && isTable && "ops-status-pill--review",
        className
      )}
      title={fullLabel}
    >
      {label}
    </span>
  );
}

function StatusBadgeStack({
  className,
  prefix,
  children,
}: {
  className?: string;
  prefix: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("admin-status-badge-stack flex flex-col gap-0.5", className)}>
      <span className="text-[0.7rem] leading-none text-[#0f172a]">{prefix}</span>
      {children}
    </div>
  );
}

export const ApplicationStatusBadge = memo(function ApplicationStatusBadge({
  status,
  className,
  variant = "admin",
  showPrefix = true,
  density = "default",
  label: labelOverride,
  prefix: prefixOverride,
}: {
  status: string;
  className?: string;
  variant?: BadgeVariant;
  showPrefix?: boolean;
  density?: BadgeDensity;
  /** Optional translated label; falls back to the English constant. */
  label?: string;
  /** Optional translated prefix; falls back to the English constant. */
  prefix?: string;
}) {
  const key = status as ApplicationStatus;
  const label =
    labelOverride ??
    (density === "table"
      ? (APPLICATION_STATUS_TABLE_LABELS[key] ??
        status.replace(/_/g, " ").toLowerCase())
      : (APPLICATION_STATUS_LABELS[key] ??
        status.replace(/_/g, " ").toLowerCase()));
  const isTable = density === "table";
  const prefixLabel =
    prefixOverride ?? (variant === "participant" ? "Application" : "Participation");

  if (showPrefix && !isTable) {
    return (
      <StatusBadgeStack className={className} prefix={prefixLabel}>
        <ApplicationStatusPill label={label} statusKey={key} density={density} />
      </StatusBadgeStack>
    );
  }

  return (
    <ApplicationStatusPill
      label={label}
      statusKey={key}
      density={density}
      className={className}
    />
  );
});

export const PaymentStatusBadge = memo(function PaymentStatusBadge({
  status,
  className,
  variant: _variant = "admin",
  showPrefix = true,
  density = "default",
  label: labelOverride,
  fullLabel: fullLabelOverride,
  prefix: prefixOverride,
}: {
  status: string;
  className?: string;
  variant?: BadgeVariant;
  showPrefix?: boolean;
  density?: BadgeDensity;
  /** Optional translated label (the visible text); falls back to the English constant. */
  label?: string;
  /** Optional translated full label (the `title` tooltip); falls back to the English constant. */
  fullLabel?: string;
  /** Optional translated prefix; falls back to the English constant. */
  prefix?: string;
}) {
  void _variant;
  const key = normalizePaymentStatus(status);
  const fullLabel = fullLabelOverride ?? PAYMENT_STATUS_LABELS[key];
  const label =
    labelOverride ??
    (density === "table" ? PAYMENT_STATUS_TABLE_LABELS[key] : fullLabel);
  const isTable = density === "table";
  const prefixLabel = prefixOverride ?? "Payment";

  if (showPrefix && !isTable) {
    return (
      <StatusBadgeStack className={className} prefix={prefixLabel}>
        <PaymentStatusPill
          label={label}
          fullLabel={fullLabel}
          statusKey={key}
          density={density}
        />
      </StatusBadgeStack>
    );
  }

  return (
    <PaymentStatusPill
      label={label}
      fullLabel={fullLabel}
      statusKey={key}
      density={density}
      className={className}
    />
  );
});

/* —— Overall status (Participation Requests table) —— */

export type OverallStatusKey =
  | "approved"
  | "review"
  | "returned"
  | "rejected"
  | "pending";

/** Collapses application status + suspension into the single overall state
 *  shown in the Participation Requests table. */
export function overallStatusOf(
  applicationStatus: string,
  suspended = false
): { key: OverallStatusKey; label: string } {
  if (suspended) return { key: "rejected", label: "Suspended" };
  switch (applicationStatus) {
    case APPLICATION_STATUS.APPROVED:
      return { key: "approved", label: "Approved" };
    case APPLICATION_STATUS.UNDER_REVIEW:
      return { key: "review", label: "Under Review" };
    case APPLICATION_STATUS.RETURNED:
      return { key: "returned", label: "Returned" };
    case APPLICATION_STATUS.REJECTED:
      return { key: "rejected", label: "Rejected" };
    default:
      return { key: "pending", label: "Pending" };
  }
}

const overallIcons: Record<OverallStatusKey, ReactNode> = {
  approved: <CheckCircle2 aria-hidden />,
  review: <Clock aria-hidden />,
  returned: <CornerUpLeft aria-hidden />,
  rejected: <XCircle aria-hidden />,
  pending: <Hourglass aria-hidden />,
};

/** Icon pill — “✓ Approved”, “🕐 Under Review”, “↩ Returned”, “⊗ Rejected”. */
export const OverallStatusBadge = memo(function OverallStatusBadge({
  applicationStatus,
  suspended = false,
  className,
}: {
  applicationStatus: string;
  suspended?: boolean;
  className?: string;
}) {
  const overall = overallStatusOf(applicationStatus, suspended);
  return (
    <span
      className={cn(
        "admin-overall-badge",
        `admin-overall-badge--${overall.key}`,
        className
      )}
      title={overall.label}
    >
      {overallIcons[overall.key]}
      {overall.label}
    </span>
  );
});
