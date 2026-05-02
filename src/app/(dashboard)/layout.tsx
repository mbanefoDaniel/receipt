import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { requireAuth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <div className="hidden h-screen sticky top-0 md:block">
          <Sidebar />
        </div>
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <MobileNav />
          <main className="min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
