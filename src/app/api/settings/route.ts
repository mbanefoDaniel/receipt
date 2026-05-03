import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getRequestSession } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { settingsSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.businessSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 }
  });

  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = await consumeRateLimit({
    key: `settings:update:${session.adminId}:${forwardedFor}`,
    limit: 20,
    windowMs: 10 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many settings updates. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } }
    );
  }

  const json = await request.json();
  const parsed = settingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const settings = await db.businessSettings.upsert({
    where: { id: 1 },
    update: {
      businessName: payload.businessName,
      motto: payload.motto || null,
      logoUrl: payload.logoUrl || null,
      footerText: payload.footerText,
      defaultWarranty: payload.defaultWarranty || null,
      contactEmail: payload.contactEmail || null,
      contactPhone: payload.contactPhone || null,
      contactPhoneAlt: payload.contactPhoneAlt || null,
      socialHandle: payload.socialHandle || null,
      address: payload.address || null
    },
    create: {
      id: 1,
      businessName: payload.businessName,
      motto: payload.motto || null,
      logoUrl: payload.logoUrl || null,
      footerText: payload.footerText,
      defaultWarranty: payload.defaultWarranty || null,
      contactEmail: payload.contactEmail || null,
      contactPhone: payload.contactPhone || null,
      contactPhoneAlt: payload.contactPhoneAlt || null,
      socialHandle: payload.socialHandle || null,
      address: payload.address || null
    }
  });

  logAudit({ action: "settings.update", adminId: session.adminId, ip: forwardedFor });
  return NextResponse.json(settings);
}
