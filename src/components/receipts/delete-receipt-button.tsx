"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteReceiptButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    const ok = window.confirm("Delete this receipt permanently?");
    if (!ok) return;

    startTransition(async () => {
      const res = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete receipt");
        return;
      }
      toast.success("Receipt deleted");
      router.refresh();
    });
  }

  return (
    <Button variant="destructive" size="sm" disabled={isPending} onClick={onDelete} type="button">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>
  );
}
