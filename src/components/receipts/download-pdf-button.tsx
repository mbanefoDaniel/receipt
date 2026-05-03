"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceiptPdfDocument } from "@/components/receipts/receipt-pdf-document";

type DownloadPdfButtonProps = {
  receipt: {
    receiptNumber: string;
    issuedAt: string;
    paymentMethod: string;
    subtotal: number;
    discount: number;
    total: number;
    notes?: string | null;
    warrantyNotes?: string | null;
    customer: {
      name: string;
      email?: string | null;
      phone?: string | null;
    };
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
  };
  settings: {
    businessName: string;
    motto?: string | null;
    logoUrl?: string | null;
    footerText: string;
    contactPhone?: string | null;
    contactPhoneAlt?: string | null;
    socialHandle?: string | null;
    contactEmail?: string | null;
    address?: string | null;
  };
  verifyUrl: string;
  qrDataUrl?: string;
};

export function DownloadPdfButton({ receipt, settings, verifyUrl, qrDataUrl }: DownloadPdfButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleDownload() {
    setLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <ReceiptPdfDocument receipt={receipt} settings={settings} verifyUrl={verifyUrl} qrDataUrl={qrDataUrl} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${receipt.receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <Button variant="outline" type="button" disabled>
        <Download className="mr-2 h-4 w-4" />
        Preparing PDF...
      </Button>
    );
  }

  return (
    <Button variant="outline" type="button" onClick={handleDownload} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Generating..." : "Download PDF"}
    </Button>
  );
}
