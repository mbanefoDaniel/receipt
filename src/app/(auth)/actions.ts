"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";
import { consumeRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  const loginKey = `login:${parsed.data.email.toLowerCase()}`;
  const loginLimiter = consumeRateLimit({
    key: loginKey,
    limit: 5,
    windowMs: 10 * 60 * 1000
  });

  if (!loginLimiter.allowed) {
    redirect("/login?error=too-many-attempts");
  }

  const admin = await db.admin.findUnique({ where: { email: parsed.data.email } });
  if (!admin) {
    redirect("/login?error=invalid");
  }

  const isValidPassword = await compare(parsed.data.password, admin.passwordHash);
  if (!isValidPassword) {
    redirect("/login?error=invalid");
  }

  resetRateLimit(loginKey);
  await createSessionCookie({ adminId: admin.id, email: admin.email });
  redirect("/dashboard");
}
