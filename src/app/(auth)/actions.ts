"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";
import { consumeRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { loginSchema } from "@/lib/validators";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const loginKey = `login:${parsed.data.email.toLowerCase()}`;

  const loginLimiter = await consumeRateLimit({
    key: loginKey,
    limit: 5,
    windowMs: 15 * 60 * 1000
  });

  if (!loginLimiter.allowed) {
    logAudit({ action: "login.locked", ip, meta: { email: parsed.data.email } });
    redirect("/login?error=too-many-attempts");
  }

  const admin = await db.admin.findUnique({ where: { email: parsed.data.email } });
  if (!admin) {
    logAudit({ action: "login.failed", ip, meta: { email: parsed.data.email } });
    redirect("/login?error=invalid");
  }

  const isValidPassword = await compare(parsed.data.password, admin.passwordHash);
  if (!isValidPassword) {
    logAudit({ action: "login.failed", ip, meta: { email: parsed.data.email } });
    redirect("/login?error=invalid");
  }

  await resetRateLimit(loginKey);
  logAudit({ action: "login.success", adminId: admin.id, ip });
  await createSessionCookie({ adminId: admin.id, email: admin.email });
  redirect("/dashboard");
}
