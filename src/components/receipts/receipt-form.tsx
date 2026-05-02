"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MinusCircle, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { createReceiptSchema, type CreateReceiptInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

const defaultValues: CreateReceiptInput = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  paymentMethod: "TRANSFER",
  discount: 0,
  notes: "",
  warrantyNotes: "",
  items: [{ description: "", serialNumber: "", quantity: 1, unitPrice: 0 }]
};

export function ReceiptForm({ defaultWarranty }: { defaultWarranty?: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateReceiptInput>({
    resolver: zodResolver(createReceiptSchema),
    defaultValues: {
      ...defaultValues,
      warrantyNotes: defaultWarranty || ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const items = form.watch("items");
  const discount = Number(form.watch("discount") || 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  const total = Math.max(subtotal - discount, 0);

  function onSubmit(values: CreateReceiptInput) {
    startTransition(async () => {
      const response = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        let msg = "Could not create receipt";
        if (errData?.error) {
          if (typeof errData.error === "string") {
            msg = errData.error;
          } else if (errData.error.formErrors?.length) {
            msg = errData.error.formErrors.join(", ");
          } else if (errData.error.fieldErrors) {
            const fields = Object.entries(errData.error.fieldErrors as Record<string, string[]>)
              .map(([k, v]) => `${k}: ${v.join(", ")}`)
              .join("; ");
            msg = fields || msg;
          }
        }
        toast.error(msg);
        return;
      }

      const data = await response.json();
      toast.success(`Receipt ${data.receiptNumber} created`);
      router.push(`/receipts/${data.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            <Label>Name</Label>
            <Input {...form.register("customerName")} placeholder="Customer full name" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input {...form.register("customerEmail")} placeholder="Optional" type="email" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input {...form.register("customerPhone")} placeholder="Optional" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1.8fr_1fr_0.6fr_0.8fr_auto]">
              <Input {...form.register(`items.${index}.description`)} placeholder="Item description" />
              <Input {...form.register(`items.${index}.serialNumber`)} placeholder="Serial no. (optional)" />
              <Input {...form.register(`items.${index}.quantity`)} type="number" min={1} />
              <Input {...form.register(`items.${index}.unitPrice`)} type="number" min={0} step="0.01" />
              <Button
                type="button"
                variant="ghost"
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
                aria-label="Remove item"
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ description: "", serialNumber: "", quantity: 1, unitPrice: 0 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment & Notes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={form.watch("paymentMethod")}
              onValueChange={(value) => form.setValue("paymentMethod", value as CreateReceiptInput["paymentMethod"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
                <SelectItem value="POS">POS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Discount</Label>
            <Input {...form.register("discount")} type="number" min={0} step="0.01" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Notes</Label>
            <Textarea {...form.register("notes")} placeholder="Optional notes" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Warranty Notes</Label>
            <Textarea {...form.register("warrantyNotes")} placeholder="Warranty information" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div className="space-y-1 text-sm">
            <p>Subtotal: {formatCurrency(subtotal)}</p>
            <p>Discount: {formatCurrency(discount)}</p>
            <p className="text-lg font-semibold">Total: {formatCurrency(total)}</p>
          </div>
          <Button disabled={isPending} type="submit">
            {isPending ? "Creating..." : "Create Receipt"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
