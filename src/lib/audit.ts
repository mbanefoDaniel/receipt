import { Prisma } from "@prisma/client";
import { db } from "./db";

type AuditAction =
  | "login.success"
  | "login.failed"
  | "login.locked"
  | "receipt.create"
  | "receipt.delete"
  | "settings.update";

type AuditOptions = {
  action: AuditAction;
  adminId?: number;
  ip?: string;
  meta?: Record<string, unknown>;
};

/**
 * Fire-and-forget audit log. Never throws — failures are silently swallowed
 * so a logging error never disrupts the main request.
 */
export function logAudit(options: AuditOptions): void {
  db.auditLog
    .create({
      data: {
        action: options.action,
        adminId: options.adminId ?? null,
        ip: options.ip ?? null,
        meta: options.meta ?? Prisma.JsonNull
      }
    })
    .catch(() => {
      // intentionally silent
    });
}
