"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  const admin = await db.admin.findUnique({ where: { email: parsed.data.email } });
  if (!admin) {
    redirect("/login?error=invalid");
  }

  const isValidPassword = await compare(parsed.data.password, admin.passwordHash);
  if (!isValidPassword) {
    redirect("/login?error=invalid");
  }

  await createSessionCookie({ adminId: admin.id, email: admin.email });
  redirect("/dashboard");
}
