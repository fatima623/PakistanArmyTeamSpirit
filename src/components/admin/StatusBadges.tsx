import { memo, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
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
  APPROVED: "ops-status-approved",
  REJECTED: "ops-status-rejected",
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
}: {
  status: string;
  className?: string;
  variant?: BadgeVariant;
  showPrefix?: boolean;
  density?: BadgeDensity;
}) {
  const key = status as ApplicationStatus;
  const label =
    density === "table"
      ? (APPLICATION_STATUS_TABLE_LABELS[key] ??
        status.replace(/_/g, " ").toLowerCase())
      : (APPLICATION_STATUS_LABELS[key] ??
        status.replace(/_/g, " ").toLowerCase());
  const isTable = density === "table";
  const prefixLabel = variant === "participant" ? "Application" : "Participation";

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
}: {
  status: string;
  className?: string;
  variant?: BadgeVariant;
  showPrefix?: boolean;
  density?: BadgeDensity;
}) {
  void _variant;
  const key = normalizePaymentStatus(status);
  const fullLabel = PAYMENT_STATUS_LABELS[key];
  const label =
    density === "table" ? PAYMENT_STATUS_TABLE_LABELS[key] : fullLabel;
  const isTable = density === "table";
  const prefixLabel = "Payment";

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
