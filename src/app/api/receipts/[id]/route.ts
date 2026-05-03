import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getRequestSession } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const receipt = await db.receipt.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true
    }
  });

  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  return NextResponse.json(receipt);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = consumeRateLimit({
    key: `receipt:delete:${session.adminId}:${forwardedFor}`,
    limit: 20,
    windowMs: 10 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many delete requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } }
    );
  }

  const { id } = await params;
  await db.receipt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
