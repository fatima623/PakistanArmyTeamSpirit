/**
 * ISO 27001–aligned logger — never emits PII or org-specific terms.
 */

import type { AppRole } from "@/lib/compliance/constants";

type LogLevel = "info" | "warn" | "error";

type SafeLogPayload = {
  action: string;
  recordId?: string;
  actorRole?: AppRole | string;
  stage?: string;
  decision?: string;
  result: "SUCCESS" | "FAILURE";
  errorCode?: string;
};

const FORBIDDEN_KEYS = new Set([
  "email",
  "password",
  "name",
  "firstName",
  "lastName",
  "ip",
  "ipAddress",
  "token",
  "secret",
  "fileUrl",
  "proofFileName",
]);

function sanitizePayload(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      out[key] = sanitizePayload(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function emit(level: LogLevel, payload: SafeLogPayload) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    ...sanitizePayload(payload as unknown as Record<string, unknown>),
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.info(JSON.stringify(entry));
  }
}

export const auditLogger = {
  info(payload: SafeLogPayload) {
    emit("info", payload);
  },
  warn(payload: SafeLogPayload) {
    emit("warn", payload);
  },
  error(payload: SafeLogPayload) {
    emit("error", payload);
  },
};
