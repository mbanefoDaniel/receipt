import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteReceiptButton } from "@/components/receipts/delete-receipt-button";

type SearchParams = Promise<{ q?: string; payment?: string }>;

export default async function ReceiptsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const payment = params.payment?.trim() || "ALL";

  const where: Prisma.ReceiptWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { receiptNumber: { contains: q, mode: "insensitive" } },
              { customer: { name: { contains: q, mode: "insensitive" } } }
            ]
          }
        : {},
      payment !== "ALL" ? { paymentMethod: payment as never } : {}
    ]
  };

  const receipts = await db.receipt.findMany({
    where,
    include: {
      customer: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/70 px-4 py-3">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Receipt History</h2>
        <Link href="/receipts/new">
          <Button size="sm">Create Receipt</Button>
        </Link>
      </div>

      <Card className="overflow-hidden rounded-2xl border">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-base">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="flex flex-col gap-3 sm:flex-row">
            <Input name="q" defaultValue={q} placeholder="Search by customer or receipt #" className="flex-1" />
            <select
              name="payment"
              defaultValue={payment}
              className="h-10 w-full rounded-lg border bg-white px-3 text-sm dark:bg-background sm:w-40"
            >
              <option value="ALL">All methods</option>
              <option value="CASH">Cash</option>
              <option value="TRANSFER">Transfer</option>
              <option value="POS">POS</option>
            </select>
            <Button type="submit" className="w-full sm:w-auto">Apply</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-base">{receipts.length} Receipt{receipts.length !== 1 ? "s" : ""}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {receipts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No receipts found. Create one to get started.
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="divide-y md:hidden">
                {receipts.map((receipt) => (
                  <div key={receipt.id} className="flex items-center justify-between gap-2 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{receipt.receiptNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">{receipt.customer.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{receipt.paymentMethod}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(receipt.issuedAt)}</span>
                      </div>
                    </div>
                    <div className="max-w-[48%] shrink-0 text-right">
                      <p className="truncate text-sm font-semibold">{formatCurrency(Number(receipt.total))}</p>
                      <div className="mt-1 flex justify-end gap-1">
                        <Link href={`/receipts/${receipt.id}`}>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">View</Button>
                        </Link>
                        <DeleteReceiptButton id={receipt.id} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/60">
                      <TableHead>Receipt</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.map((receipt) => (
                      <TableRow key={receipt.id} className="odd:bg-slate-50/30">
                        <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                        <TableCell>{receipt.customer.name}</TableCell>
                        <TableCell>{formatDate(receipt.issuedAt)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{receipt.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(Number(receipt.total))}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/receipts/${receipt.id}`}>
                              <Button size="sm" variant="outline">View</Button>
                            </Link>
                            <DeleteReceiptButton id={receipt.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
