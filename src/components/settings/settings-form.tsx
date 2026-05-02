"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { settingsSchema, type SettingsInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogoUploader } from "@/components/settings/logo-uploader";

type SettingsFormProps = {
  defaultValues: SettingsInput;
};

export function SettingsForm({ defaultValues }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues
  });

  function onSubmit(values: SettingsInput) {
    startTransition(async () => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        toast.error("Failed to update settings");
        return;
      }

      toast.success("Settings updated");
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Business Name</Label>
          <Input {...form.register("businessName")} />
        </div>
        <div className="space-y-2">
          <Label>Motto / Tagline</Label>
          <Input {...form.register("motto")} placeholder="your one stop gadget store" />
        </div>
        <div className="space-y-2">
          <Label>Logo URL</Label>
          <Input {...form.register("logoUrl")} placeholder="https://..." />
        </div>
      </div>

      <LogoUploader onUploaded={(url) => form.setValue("logoUrl", url)} />

      <div className="space-y-2">
        <Label>Footer Text</Label>
        <Textarea {...form.register("footerText")} />
      </div>

      <div className="space-y-2">
        <Label>Default Warranty Text</Label>
        <Textarea {...form.register("defaultWarranty")} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Contact Email</Label>
          <Input {...form.register("contactEmail")} type="email" placeholder="hello@company.com" />
        </div>
        <div className="space-y-2">
          <Label>Contact Phone</Label>
          <Input {...form.register("contactPhone")} placeholder="+234..." />
        </div>
        <div className="space-y-2">
          <Label>Alternate Phone</Label>
          <Input {...form.register("contactPhoneAlt")} placeholder="+234..." />
        </div>
        <div className="space-y-2">
          <Label>Social Handle</Label>
          <Input {...form.register("socialHandle")} placeholder="@NefoGadgets" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Business Address</Label>
        <Textarea {...form.register("address")} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
