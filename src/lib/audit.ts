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
  meta?: Prisma.InputJsonValue;
};

export function logAudit(options: AuditOptions): void {
  db.auditLog
    .create({
      data: {
        action: options.action,
        adminId: options.adminId ?? null,
        ip: options.ip ?? null,
        meta: options.meta !== undefined ? options.meta : Prisma.DbNull
      }
    })
    .catch(() => {});
}
