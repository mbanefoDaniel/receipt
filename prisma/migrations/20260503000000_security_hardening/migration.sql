-- Add verifyToken to Receipt (uuid for each existing row, unique)
ALTER TABLE "Receipt" ADD COLUMN "verifyToken" TEXT NOT NULL DEFAULT gen_random_uuid()::text;
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_verifyToken_key" UNIQUE ("verifyToken");

-- RateLimit table for persistent, cross-instance rate limiting
CREATE TABLE "RateLimit" (
    "key"       TEXT         NOT NULL,
    "count"     INTEGER      NOT NULL DEFAULT 0,
    "resetAt"   TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- AuditLog table
CREATE TABLE "AuditLog" (
    "id"        TEXT         NOT NULL,
    "action"    TEXT         NOT NULL,
    "adminId"   INTEGER,
    "meta"      JSONB,
    "ip"        TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
