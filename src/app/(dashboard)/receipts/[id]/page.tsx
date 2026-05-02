import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AtSign, Mail, MapPin, Phone, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptActions } from "@/components/receipts/receipt-actions";

type Params = Promise<{ id: string }>;

export default async function ReceiptDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  const [receipt, settings] = await Promise.all([
    db.receipt.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true
      }
    }),
    db.businessSettings.findUnique({ where: { id: 1 } })
  ]);

  if (!receipt) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify/${receipt.receiptNumber}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl);

  const settingsPayload = {
    businessName: settings?.businessName || "Your Business",
    motto: settings?.motto || null,
    logoUrl: settings?.logoUrl,
    footerText: settings?.footerText || "Thank you for your business.",
    contactPhone: settings?.contactPhone || null,
    contactPhoneAlt: settings?.contactPhoneAlt || null,
    socialHandle: settings?.socialHandle || null,
    contactEmail: settings?.contactEmail || null,
    address: settings?.address || null
  };

  const receiptPayload = {
    receiptNumber: receipt.receiptNumber,
    issuedAt: receipt.issuedAt.toISOString(),
    paymentMethod: receipt.paymentMethod,
    subtotal: Number(receipt.subtotal),
    discount: Number(receipt.discount),
    total: Number(receipt.total),
    notes: receipt.notes,
    warrantyNotes: receipt.warrantyNotes,
    customer: {
      name: receipt.customer.name,
      email: receipt.customer.email,
      phone: receipt.customer.phone
    },
    items: receipt.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal)
    }))
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/70 px-4 py-3 shadow-soft backdrop-blur-sm">
        <h2 className="text-2xl font-semibold tracking-tight">{receipt.receiptNumber}</h2>
        <ReceiptActions receipt={receiptPayload} settings={settingsPayload} verifyUrl={verifyUrl} qrDataUrl={qrDataUrl} />
      </div>

      <Card className="overflow-hidden rounded-2xl border shadow-soft print:shadow-none" data-receipt-print>
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="break-words text-3xl tracking-tight">{settingsPayload.businessName}</CardTitle>
              {settingsPayload.motto ? <p className="text-sm italic text-muted-foreground">{settingsPayload.motto}</p> : null}
              <p className="text-sm text-muted-foreground">Receipt #{receipt.receiptNumber}</p>
              <div className="mt-2 flex max-w-full flex-wrap gap-x-4 gap-y-1 text-xs leading-relaxed text-muted-foreground">
                {settingsPayload.contactPhone ? (
                  <span className="flex min-w-0 items-center gap-1.5 break-words">
                    <Phone className="h-3 w-3 shrink-0" />
                    {settingsPayload.contactPhone}
                  </span>
                ) : null}
                {settingsPayload.contactPhoneAlt ? (
                  <span className="flex min-w-0 items-center gap-1.5 break-words">
                    <Smartphone className="h-3 w-3 shrink-0" />
                    {settingsPayload.contactPhoneAlt}
                  </span>
                ) : null}
                {settingsPayload.socialHandle ? (
                  <span className="flex min-w-0 items-center gap-1.5 break-words">
                    <AtSign className="h-3 w-3 shrink-0" />
                    {settingsPayload.socialHandle}
                  </span>
                ) : null}
                {settingsPayload.contactEmail ? (
                  <span className="flex min-w-0 items-center gap-1.5 break-words">
                    <Mail className="h-3 w-3 shrink-0" />
                    {settingsPayload.contactEmail}
                  </span>
                ) : null}
                {settingsPayload.address ? (
                  <span className="flex min-w-0 items-center gap-1.5 break-words">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {settingsPayload.address}
                  </span>
                ) : null}
              </div>
            </div>
            {settingsPayload.logoUrl ? (
              <Image
                src={settingsPayload.logoUrl}
                alt="Business logo"
                width={96}
                height={50}
                className="h-auto w-24 rounded-md border bg-white p-1"
              />
            ) : (
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-md border bg-muted text-2xl font-semibold">
                NG
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</p>
              <p className="mt-1 font-medium">{receipt.customer.name}</p>
              <p className="text-sm text-muted-foreground">{receipt.customer.email || "No email"}</p>
              <p className="text-sm text-muted-foreground">{receipt.customer.phone || "No phone"}</p>
            </div>
            <div className="rounded-xl border bg-muted/40 p-4 text-left md:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Issued</p>
              <p className="mt-1 font-medium">{formatDate(receipt.issuedAt)}</p>
              <p className="text-sm text-muted-foreground">Payment: {receipt.paymentMethod}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Unit Price</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item) => (
                  <tr key={item.id} className="border-t odd:bg-muted/30">
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{formatCurrency(Number(item.unitPrice))}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(Number(item.lineTotal))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm">{receipt.notes || "No additional notes."}</p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Warranty</p>
                <p className="mt-1 text-sm">{receipt.warrantyNotes || "No warranty notes."}</p>
              </div>
            </div>
            <div className="rounded-xl border bg-muted/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(Number(receipt.subtotal))}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span>{formatCurrency(Number(receipt.discount))}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t pt-2 text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(Number(receipt.total))}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/40 p-4">
            <div>
              <p className="text-sm font-semibold">Scan to verify this receipt</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Confirm this receipt is genuinely from {settingsPayload.businessName}
              </p>
              <Link className="mt-1 block text-xs text-primary break-all" href={verifyUrl}>
                {receipt.receiptNumber}
              </Link>
            </div>
            <Image src={qrDataUrl} alt="Receipt QR" width={84} height={84} />
          </div>

          <p className="text-xs text-muted-foreground">{settingsPayload.footerText}</p>
        </CardContent>
      </Card>
    </div>
  );
}
