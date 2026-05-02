import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20" />
      <Skeleton className="h-[540px]" />
    </div>
  );
}
