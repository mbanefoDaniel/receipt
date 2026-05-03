import { loginAction } from "@/app/(auth)/actions";
import { Cpu, Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 md:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-15%] top-[-25%] h-[420px] w-[420px] rounded-full bg-cyan-500/30 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(14,165,233,0.2),transparent_36%),radial-gradient(circle_at_78%_74%,rgba(37,99,235,0.2),transparent_36%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_31px,hsl(var(--border))_32px),linear-gradient(to_bottom,transparent_0,transparent_31px,hsl(var(--border))_32px)] bg-[size:32px_32px] opacity-40" />
      </div>

      <div className="relative mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_400px]">
        <section className="hidden rounded-2xl border bg-card/70 p-8 shadow-soft backdrop-blur-sm lg:block">
          <p className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <Cpu className="h-3.5 w-3.5" />
            Secure Access Node
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">Receipt Studio Admin</h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Centralized control for internal receipts, customer history, and verification workflow.
          </p>

          <div className="mt-8 grid gap-3">
            <div className="flex items-center gap-3 rounded-xl border bg-background/70 p-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-sm">Single-admin protected session</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-background/70 p-3">
              <Fingerprint className="h-4 w-4 text-primary" />
              <p className="text-sm">Credential-verified entry point</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-background/70 p-3">
              <LockKeyhole className="h-4 w-4 text-primary" />
              <p className="text-sm">JWT + HTTP-only cookie auth flow</p>
            </div>
          </div>
        </section>

        <Card className="w-full max-w-md justify-self-center rounded-2xl border bg-card/85 shadow-soft backdrop-blur-sm sm:max-w-lg lg:max-w-none">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Secure access to your internal receipt dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            {params.error === "invalid" ? (
              <p className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Invalid email or password.
              </p>
            ) : null}
            {params.error === "too-many-attempts" ? (
              <p className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Too many failed attempts. Please wait a few minutes and try again.
              </p>
            ) : null}

            <form action={loginAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="admin@yourbusiness.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button className="w-full" type="submit">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
