import { auditLogger } from "@/lib/compliance/logger";
import { prisma } from "@/lib/prisma";

export async function createAuditLog(params: {
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        actorId: params.actorId ?? null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
    auditLogger.info({
      action: params.action,
      recordId: params.entityId,
      result: "SUCCESS",
    });
  } catch {
    auditLogger.error({
      action: params.action,
      recordId: params.entityId,
      result: "FAILURE",
      errorCode: "AUDIT_PERSIST_FAILED",
    });
  }
}
