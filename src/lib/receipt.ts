import { db } from "@/lib/db";

export async function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const prefix = `RCPT-${year}-`;

  const lastReceipt = await db.receipt.findFirst({
    where: {
      receiptNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      receiptNumber: true
    }
  });

  const next = lastReceipt
    ? Number(lastReceipt.receiptNumber.split("-").pop() ?? "0") + 1
    : 1;

  return `${prefix}${String(next).padStart(4, "0")}`;
}
