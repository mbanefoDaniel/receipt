import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
      {/* mobile: show brand name; desktop: show subtitle */}
      <div className="flex items-center gap-2 md:gap-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-white md:hidden">
          NG
        </div>
        <div>
          <p className="text-sm font-semibold md:font-medium">Receipt Studio</p>
          <p className="hidden text-xs text-muted-foreground md:block">Fast creation, tracking, and verification</p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
