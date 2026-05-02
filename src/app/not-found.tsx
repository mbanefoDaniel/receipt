import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">The page you requested does not exist.</p>
      <Link href="/dashboard" className="mt-6">
        <Button>Go to Dashboard</Button>
      </Link>
    </main>
  );
}
