import { Skeleton } from "@/components/ui/skeleton";

export default function NewReceiptLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16" />
      <Skeleton className="h-[720px]" />
    </div>
  );
}
