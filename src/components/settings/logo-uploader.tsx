"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { createBrowserSupabase } from "@/lib/supabase";

type LogoUploaderProps = {
  onUploaded: (url: string) => void;
};

export function LogoUploader({ onUploaded }: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const supabase = createBrowserSupabase();
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "business-assets";
      const path = `logos/${Date.now()}-${file.name}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false
      });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onUploaded(data.publicUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted">
        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        Upload Logo
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
}
