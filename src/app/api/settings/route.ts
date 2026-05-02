import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getRequestSession } from "@/lib/auth";
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

  return NextResponse.json(settings);
}
