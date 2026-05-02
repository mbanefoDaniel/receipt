import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const settings = await db.businessSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 }
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card/70 px-4 py-3">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Settings</h2>
        <p className="text-sm text-muted-foreground">Configure business profile and receipt defaults.</p>
      </div>

      <Card className="overflow-hidden rounded-2xl border">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-base">Business Settings</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <SettingsForm
            defaultValues={{
              businessName: settings.businessName,
              motto: settings.motto || "",
              logoUrl: settings.logoUrl || "",
              footerText: settings.footerText,
              defaultWarranty: settings.defaultWarranty || "",
              contactEmail: settings.contactEmail || "",
              contactPhone: settings.contactPhone || "",
              contactPhoneAlt: settings.contactPhoneAlt || "",
              socialHandle: settings.socialHandle || "",
              address: settings.address || ""
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
