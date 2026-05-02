import { Receipt, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type StatsCardsProps = {
  totalReceipts: number;
  totalRevenue: number;
  monthRevenue: number;
};

export function StatsCards({ totalReceipts, totalRevenue, monthRevenue }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Receipts",
      value: totalReceipts.toLocaleString(),
      icon: Receipt,
      accent: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
    },
    {
      title: "This Month",
      value: formatCurrency(monthRevenue),
      icon: BarChart3,
      accent: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
    }
  ];

  return (
    <section className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="overflow-hidden rounded-2xl border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <p className="truncate text-xl font-semibold tracking-tight">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
