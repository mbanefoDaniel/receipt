import type { PaymentMethod } from "@prisma/client";

export type DashboardMetric = {
  totalReceipts: number;
  totalRevenue: number;
};

export type MonthlyRevenuePoint = {
  month: string;
  revenue: number;
};

export type ReceiptWithRelations = {
  id: string;
  receiptNumber: string;
  issuedAt: Date;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes: string | null;
  warrantyNotes: string | null;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};
