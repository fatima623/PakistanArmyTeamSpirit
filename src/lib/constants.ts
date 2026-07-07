export const APPLICATION_STATUS = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RETURNED: "RETURNED",
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
  RETURNED: "RETURNED",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/** Legacy values still present in some DB rows */
export const LEGACY_PAYMENT_STATUS = {
  APPROVED: "APPROVED",
} as const;

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  RETURNED: "Returned for Correction",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Payment Required",
  SUBMITTED: "Payment Submitted",
  UNDER_REVIEW: "Under Review",
  VERIFIED: "Payment Verified",
  REJECTED: "Proof Rejected",
  RETURNED: "Returned for Correction",
};

/** Compact labels for admin data tables */
export const APPLICATION_STATUS_TABLE_LABELS: Record<ApplicationStatus, string> =
  {
    PENDING: "Pending",
    UNDER_REVIEW: "In review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    RETURNED: "Returned",
  };

export const PAYMENT_STATUS_TABLE_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Required",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "In review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  RETURNED: "Returned",
};

export const PAYMENT_STATUS_FILTER_LABELS: Record<string, string> = {
  all: "All",
  [PAYMENT_STATUS.PENDING]: "Required",
  [PAYMENT_STATUS.SUBMITTED]: "Submitted",
  [PAYMENT_STATUS.UNDER_REVIEW]: "In review",
  [PAYMENT_STATUS.VERIFIED]: "Verified",
  [PAYMENT_STATUS.REJECTED]: "Rejected",
  [PAYMENT_STATUS.RETURNED]: "Returned",
};

export function normalizePaymentStatus(value: string): PaymentStatus {
  if (value === LEGACY_PAYMENT_STATUS.APPROVED) {
    return PAYMENT_STATUS.VERIFIED;
  }
  const allowed = Object.values(PAYMENT_STATUS);
  if (allowed.includes(value as PaymentStatus)) {
    return value as PaymentStatus;
  }
  return PAYMENT_STATUS.PENDING;
}

export function isPaymentVerified(status: string): boolean {
  return (
    status === PAYMENT_STATUS.VERIFIED ||
    status === LEGACY_PAYMENT_STATUS.APPROVED
  );
}

export function isPaymentAwaitingVerification(status: string): boolean {
  return (
    status === PAYMENT_STATUS.SUBMITTED ||
    status === PAYMENT_STATUS.UNDER_REVIEW
  );
}

export function canResubmitPayment(status: string): boolean {
  const key = normalizePaymentStatus(status);
  return (
    key === PAYMENT_STATUS.PENDING ||
    key === PAYMENT_STATUS.REJECTED ||
    key === PAYMENT_STATUS.RETURNED
  );
}

export const AUDIT_ENTITY = {
  USER: "user",
  PAYMENT: "payment",
  UNIT: "unit",
  TICKET: "ticket",
  TEAM_SIZE_REQUEST: "team_size_request",
  FLIGHT_DETAIL: "flight_detail",
} as const;

/** Fallback team-member cap when SiteSettings is unavailable. */
export const DEFAULT_MAX_TEAM_MEMBERS = 13;

export const TEAM_SIZE_REQUEST_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type TeamSizeRequestStatus =
  (typeof TEAM_SIZE_REQUEST_STATUS)[keyof typeof TEAM_SIZE_REQUEST_STATUS];

export const TEAM_SIZE_REQUEST_STATUS_LABELS: Record<
  TeamSizeRequestStatus,
  string
> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function normalizeTeamSizeRequestStatus(
  value: string
): TeamSizeRequestStatus {
  const allowed = Object.values(TEAM_SIZE_REQUEST_STATUS);
  return allowed.includes(value as TeamSizeRequestStatus)
    ? (value as TeamSizeRequestStatus)
    : TEAM_SIZE_REQUEST_STATUS.PENDING;
}

export const TICKET_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

/** Statuses a ticket can still receive replies / be acted on in. */
export const TICKET_OPEN_STATUSES: TicketStatus[] = [
  TICKET_STATUS.OPEN,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.RESOLVED,
];

export const TICKET_PRIORITY = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
} as const;

export type TicketPriority =
  (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
};

export const TICKET_CATEGORY = {
  GENERAL: "GENERAL",
  REGISTRATION: "REGISTRATION",
  PAYMENT: "PAYMENT",
  TECHNICAL: "TECHNICAL",
} as const;

export type TicketCategory =
  (typeof TICKET_CATEGORY)[keyof typeof TICKET_CATEGORY];

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  GENERAL: "General enquiry",
  REGISTRATION: "Registration",
  PAYMENT: "Payment",
  TECHNICAL: "Technical issue",
};

export function normalizeTicketStatus(value: string): TicketStatus {
  const allowed = Object.values(TICKET_STATUS);
  return allowed.includes(value as TicketStatus)
    ? (value as TicketStatus)
    : TICKET_STATUS.OPEN;
}

export function isTicketClosed(status: string): boolean {
  return status === TICKET_STATUS.CLOSED;
}
