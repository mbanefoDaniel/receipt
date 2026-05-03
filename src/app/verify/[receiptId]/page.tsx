import { headers } from "next/headers";
import { db } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

type Params = Promise<{ receiptId: string }>;

export default async function VerifyReceiptPage({ params }: { params: Params }) {
  const { receiptId } = await params;

  // Rate limit the public verify endpoint to prevent enumeration
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await consumeRateLimit({ key: `verify:${ip}`, limit: 30, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10">
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Too many requests. Please try again shortly.
          </CardContent>
        </Card>
      </main>
    );
  }

  // Look up by the opaque verifyToken (UUID), not the sequential receiptNumber
  const receipt = await db.receipt.findUnique({
    where: {
      verifyToken: receiptId
    },
    include: {
      customer: true,
      items: true
    }
  });

  const valid = Boolean(receipt);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Receipt Verification
            <Badge variant={valid ? "success" : "warning"}>{valid ? "Valid" : "Invalid"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!receipt ? (
            <p className="text-sm text-muted-foreground">Receipt not found. Please confirm the receipt ID.</p>
          ) : (
            <>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Receipt Number</p>
                <p className="font-medium">{receipt.receiptNumber}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Customer</p>
                  <p className="font-medium">{receipt.customer.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(Number(receipt.total))}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(receipt.issuedAt)}</p>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Items</p>
                <ul className="space-y-2 text-sm">
                  {receipt.items.map((item) => (
                    <li key={item.id} className="rounded-md border p-2">
                      {item.description} • Qty {item.quantity} • {formatCurrency(Number(item.lineTotal))}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
