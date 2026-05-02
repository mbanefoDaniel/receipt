"use client";

import { useEffect, useState, type ComponentType } from "react";
import type { PDFDownloadLinkProps } from "@react-pdf/renderer";
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
};

export function DownloadPdfButton({ receipt, settings, verifyUrl }: DownloadPdfButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [PDFDownloadLinkComponent, setPDFDownloadLinkComponent] = useState<ComponentType<PDFDownloadLinkProps> | null>(null);

  useEffect(() => {
    setMounted(true);
    let active = true;

    import("@react-pdf/renderer")
      .then((module) => {
        if (active) {
          setPDFDownloadLinkComponent(() => module.PDFDownloadLink as ComponentType<PDFDownloadLinkProps>);
        }
      })
      .catch(() => {
        setPDFDownloadLinkComponent(null);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!mounted || !PDFDownloadLinkComponent) {
    return (
      <Button variant="outline" type="button" disabled>
        <Download className="mr-2 h-4 w-4" />
        Preparing PDF...
      </Button>
    );
  }

  return (
    <PDFDownloadLinkComponent
      document={<ReceiptPdfDocument receipt={receipt} settings={settings} verifyUrl={verifyUrl} />}
      fileName={`${receipt.receiptNumber}.pdf`}
    >
      {({ loading }: { loading: boolean }) => (
        <Button variant="outline" type="button">
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Preparing PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLinkComponent>
  );
}
