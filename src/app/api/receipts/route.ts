import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getRequestSession } from "@/lib/auth";
import { createReceiptSchema } from "@/lib/validators";
import { generateReceiptNumber } from "@/lib/receipt";

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim();
  const payment = searchParams.get("payment")?.trim();

  const where: Prisma.ReceiptWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { receiptNumber: { contains: q, mode: "insensitive" } },
              { customer: { name: { contains: q, mode: "insensitive" } } },
              { customer: { email: { contains: q, mode: "insensitive" } } }
            ]
          }
        : {},
      payment && payment !== "ALL" ? { paymentMethod: payment as never } : {}
    ]
  };

  const receipts = await db.receipt.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: true
    }
  });

  return NextResponse.json(receipts);
}

export async function POST(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = createReceiptSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const subtotal = payload.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = Math.max(subtotal - payload.discount, 0);

  const settings = await db.businessSettings.findUnique({ where: { id: 1 } });

  const customerLookup: Prisma.CustomerWhereInput[] = [];
  if (payload.customerEmail) {
    customerLookup.push({ email: payload.customerEmail });
  }
  if (payload.customerPhone) {
    customerLookup.push({ phone: payload.customerPhone });
  }

  const customer =
    customerLookup.length > 0
      ? await db.customer.findFirst({
          where: {
            OR: customerLookup
          }
        })
      : null;

  const customerRecord = customer
    ? await db.customer.update({
        where: { id: customer.id },
        data: {
          name: payload.customerName,
          email: payload.customerEmail || null,
          phone: payload.customerPhone || null
        }
      })
    : await db.customer.create({
        data: {
          name: payload.customerName,
          email: payload.customerEmail || null,
          phone: payload.customerPhone || null
        }
      });

  const receiptNumber = await generateReceiptNumber();

  const receipt = await db.receipt.create({
    data: {
      receiptNumber,
      customerId: customerRecord.id,
      paymentMethod: payload.paymentMethod,
      subtotal,
      discount: payload.discount,
      total,
      notes: payload.notes || null,
      warrantyNotes: payload.warrantyNotes || settings?.defaultWarranty || null,
      items: {
        create: payload.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.quantity * item.unitPrice
        }))
      }
    }
  });

  return NextResponse.json({ id: receipt.id, receiptNumber: receipt.receiptNumber }, { status: 201 });
}
