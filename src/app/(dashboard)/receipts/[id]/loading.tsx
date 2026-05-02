import { Skeleton } from "@/components/ui/skeleton";

export default function ReceiptDetailLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-52" />
      <Skeleton className="h-[760px]" />
    </div>
  );
}
