import { db } from "@/lib/db";
import { ReceiptForm } from "@/components/receipts/receipt-form";

export default async function NewReceiptPage() {
  const settings = await db.businessSettings.findUnique({ where: { id: 1 } });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card/70 px-4 py-3">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Create Receipt</h2>
        <p className="text-sm text-muted-foreground">Build a professional receipt with dynamic line items.</p>
      </div>
      <ReceiptForm defaultWarranty={settings?.defaultWarranty} />
    </div>
  );
}
