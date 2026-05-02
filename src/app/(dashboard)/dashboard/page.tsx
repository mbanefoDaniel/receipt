import Link from "next/link";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { MonthlyRevenueChart } from "@/components/dashboard/monthly-revenue-chart";

export default async function DashboardPage() {
  const [count, aggregate, recentReceipts] = await Promise.all([
    db.receipt.count(),
    db.receipt.aggregate({
      _sum: {
        total: true
      }
    }),
    db.receipt.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true
      }
    })
  ]);

  const now = new Date();
  const from = startOfMonth(subMonths(now, 11));
  const revenueReceipts = await db.receipt.findMany({
    where: {
      issuedAt: {
        gte: from
      }
    },
    select: {
      issuedAt: true,
      total: true
    }
  });

  const monthlyMap = new Map<string, number>();
  for (let i = 0; i < 12; i += 1) {
    const date = addMonths(from, i);
    monthlyMap.set(format(date, "MMM yyyy"), 0);
  }

  for (const receipt of revenueReceipts) {
    const key = format(receipt.issuedAt, "MMM yyyy");
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(receipt.total));
  }

  const monthlyData = Array.from(monthlyMap.entries()).map(([month, revenue]) => ({ month, revenue }));
  const monthKey = format(now, "MMM yyyy");
  const monthRevenue = monthlyMap.get(monthKey) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/70 px-4 py-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Monitor receipts, revenue, and recent activities.</p>
        </div>
        <Link href="/receipts/new">
          <Button size="sm">Quick Create Receipt</Button>
        </Link>
      </div>

      <StatsCards
        totalReceipts={count}
        totalRevenue={Number(aggregate._sum.total ?? 0)}
        monthRevenue={monthRevenue}
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <MonthlyRevenueChart data={monthlyData} />

        <Card className="overflow-hidden rounded-2xl border">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-base">Recent Receipts</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {recentReceipts.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No receipts yet. Create your first receipt.</p>
            ) : (
              recentReceipts.map((receipt) => (
                <Link
                  href={`/receipts/${receipt.id}`}
                  key={receipt.id}
                  className="flex items-center justify-between gap-2 px-4 py-3 transition hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{receipt.receiptNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {receipt.customer.name} • {formatDate(receipt.issuedAt)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{formatCurrency(Number(receipt.total))}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
