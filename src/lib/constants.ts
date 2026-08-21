export const APPLICATION_STATUS = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RETURNED: "RETURNED",
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
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

export const AUDIT_ENTITY = {
  USER: "user",
  UNIT: "unit",
  TICKET: "ticket",
  TEAM_SIZE_REQUEST: "team_size_request",
  FLIGHT_DETAIL: "flight_detail",
  HOST_FORMATION: "host_formation",
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
  TECHNICAL: "TECHNICAL",
} as const;

export type TicketCategory =
  (typeof TICKET_CATEGORY)[keyof typeof TICKET_CATEGORY];

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  GENERAL: "General enquiry",
  REGISTRATION: "Registration",
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
