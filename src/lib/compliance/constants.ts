/**
 * Audit-safe identifiers — use ONLY these in code, APIs, logs, and new schema fields.
 * Public display copy may live in NEXT_PUBLIC_* environment variables.
 */

export const APP_ROLES = {
  TEAM_REP: "TEAM_REP",
  REVIEWER: "REVIEWER",
  ORG_ADMIN: "ORG_ADMIN",
  SYS_ADMIN: "SYS_ADMIN",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

/** Maps legacy session roles to audit-safe role labels for logging */
export const LEGACY_ROLE_TO_APP_ROLE: Record<string, AppRole> = {
  user: APP_ROLES.TEAM_REP,
  admin: APP_ROLES.ORG_ADMIN,
  superadmin: APP_ROLES.SYS_ADMIN,
};

export const REGISTRATION_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PENDING_INFO: "PENDING_INFO",
} as const;

export type RegistrationStatus =
  (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];

export const TEAM_TYPE = {
  TYPE_A: "TYPE_A",
  TYPE_B: "TYPE_B",
  TYPE_C: "TYPE_C",
} as const;

export type TeamTypeCode = (typeof TEAM_TYPE)[keyof typeof TEAM_TYPE];

export const TRAVEL_DOC_TYPE = {
  PRIMARY_ID: "PRIMARY_ID",
  TRAVEL_PERMIT: "TRAVEL_PERMIT",
  ENTRY_AUTH: "ENTRY_AUTH",
} as const;

export const HEALTH_STATUS = {
  PENDING: "PENDING",
  CLEARED: "CLEARED",
  FLAGGED: "FLAGGED",
} as const;

export const APPROVAL_STAGE = {
  STAGE_1: "STAGE_1",
  STAGE_2: "STAGE_2",
  STAGE_3: "STAGE_3",
} as const;

export type ApprovalStage = (typeof APPROVAL_STAGE)[keyof typeof APPROVAL_STAGE];

export const APPROVAL_DECISION = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RETURNED_FOR_INFO: "RETURNED_FOR_INFO",
} as const;

export type ApprovalDecision =
  (typeof APPROVAL_DECISION)[keyof typeof APPROVAL_DECISION];

export const API_ERROR_CODE = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE];

export const AUDIT_ACTION = {
  REGISTRATION_SUBMITTED: "REGISTRATION_SUBMITTED",
  REGISTRATION_UPDATED: "REGISTRATION_UPDATED",
  APPROVAL_DECISION: "APPROVAL_DECISION",
  DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED",
  AUTH_ATTEMPT: "AUTH_ATTEMPT",
  AUTH_FAILURE: "AUTH_FAILURE",
} as const;

export const ENTITY_TYPE = {
  USER: "user",
  TEAM_PROFILE: "team_profile",
  TRAVEL_DOC: "travel_document",
  COMPLIANCE_DOC: "compliance_document",
  PAYMENT: "payment",
} as const;

/** Registration wizard step IDs (generic labels in UI) */
export const REGISTRATION_STEP = {
  TEAM_INFO: 1,
  ROSTER: 2,
  TRAVEL_LIAISON: 3,
  COMPLIANCE: 4,
} as const;

export const REGISTRATION_STEP_LABELS: Record<number, string> = {
  1: "Team information",
  2: "Roster & requirements",
  3: "Travel & liaison",
  4: "Compliance & submit",
};
