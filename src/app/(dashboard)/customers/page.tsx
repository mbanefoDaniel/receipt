import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    include: {
      receipts: {
        select: {
          total: true,
          issuedAt: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card/70 px-4 py-3">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Customers</h2>
        <p className="text-sm text-muted-foreground">Customer records and receipt history.</p>
      </div>

      <Card className="overflow-hidden rounded-2xl border">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-base">Customer Directory ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No customers yet.
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="divide-y md:hidden">
                {customers.map((customer) => {
                  const totalSpend = customer.receipts.reduce((sum, r) => sum + Number(r.total), 0);
                  const lastPurchase = customer.receipts
                    .map((r) => r.issuedAt)
                    .sort((a, b) => b.getTime() - a.getTime())[0];

                  return (
                    <div key={customer.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{customer.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{customer.email || "-"}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone || "-"}</p>
                        </div>
                        <div className="max-w-[48%] shrink-0 text-right">
                          <p className="truncate text-sm font-semibold">{formatCurrency(totalSpend)}</p>
                          <p className="text-xs text-muted-foreground">{customer.receipts.length} receipt{customer.receipts.length !== 1 ? "s" : ""}</p>
                          {lastPurchase ? (
                            <p className="text-xs text-muted-foreground">{formatDate(lastPurchase)}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/60">
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Receipts</TableHead>
                      <TableHead>Total Spend</TableHead>
                      <TableHead>Last Purchase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => {
                      const totalSpend = customer.receipts.reduce((sum, r) => sum + Number(r.total), 0);
                      const lastPurchase = customer.receipts
                        .map((r) => r.issuedAt)
                        .sort((a, b) => b.getTime() - a.getTime())[0];

                      return (
                        <TableRow key={customer.id} className="odd:bg-slate-50/30">
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>
                            <p>{customer.email || "-"}</p>
                            <p className="text-xs text-muted-foreground">{customer.phone || "-"}</p>
                          </TableCell>
                          <TableCell>{customer.receipts.length}</TableCell>
                          <TableCell>{formatCurrency(totalSpend)}</TableCell>
                          <TableCell>{lastPurchase ? formatDate(lastPurchase) : "-"}</TableCell>
                        </TableRow>
                      );
                    })}
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
