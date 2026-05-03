"use client";

import { useState } from "react";
import { Copy, MessageCircle, Printer, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DownloadPdfButton } from "@/components/receipts/download-pdf-button";
import { ReceiptPdfDocument } from "@/components/receipts/receipt-pdf-document";

type ReceiptActionsProps = React.ComponentProps<typeof DownloadPdfButton>;

export function ReceiptActions(props: ReceiptActionsProps) {
  const { receipt, settings, verifyUrl } = props;
  const [sharing, setSharing] = useState(false);

  function buildShareUrl() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    try {
      const parsed = new URL(verifyUrl);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return `${origin}${parsed.pathname}`;
      }
      return parsed.toString();
    } catch {
      if (verifyUrl.startsWith("/")) {
        return `${origin}${verifyUrl}`;
      }
      return verifyUrl;
    }
  }

  function buildShareText(shareUrl: string) {
    return (
      `Receipt from ${settings.businessName}\n` +
      `Customer: ${receipt.customer.name}\n` +
      `Amount: NGN ${receipt.total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}\n` +
      `Verify: ${shareUrl}`
    );
  }

  async function handleCopyLink() {
    const shareUrl = buildShareUrl();

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Verify link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  function handleWhatsApp() {
    const shareUrl = buildShareUrl();
    const shareText = buildShareText(shareUrl);
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  }

  function handlePrint() {
    const style = document.createElement("style");
    style.id = "__receipt-print-style__";
    style.innerHTML = `
      @media print {
        body > *:not(#__receipt-print-root__) { display: none !important; }
        #__receipt-print-root__ { display: block !important; }
        #__receipt-print-root__,
        #__receipt-print-root__ * {
          font-family: "Segoe UI", "Segoe UI Symbol", Arial, sans-serif !important;
        }
      }
    `;

    const target = document.querySelector("[data-receipt-print]") as HTMLElement | null;
    if (!target) {
      window.print();
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.id = "__receipt-print-root__";
    wrapper.style.display = "none";
    wrapper.innerHTML = target.outerHTML;

    document.head.appendChild(style);
    document.body.appendChild(wrapper);

    window.print();

    // clean up after printing (or if user cancels)
    const cleanup = () => {
      style.remove();
      wrapper.remove();
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    // fallback cleanup in case afterprint doesn't fire (e.g. iOS)
    setTimeout(cleanup, 3000);
  }

  async function handleShare() {
    const shareUrl = buildShareUrl();
    const shareText = buildShareText(shareUrl);

    if (sharing) {
      return;
    }

    setSharing(true);

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        const { pdf } = await import("@react-pdf/renderer");
        const blob = await pdf(
          <ReceiptPdfDocument receipt={receipt} settings={settings} verifyUrl={verifyUrl} qrDataUrl={props.qrDataUrl} />
        ).toBlob();
        const file = new File([blob], `${receipt.receiptNumber}.pdf`, { type: "application/pdf" });

        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Receipt ${receipt.receiptNumber}`,
            text: shareText,
            files: [file]
          });
          toast.success("Receipt shared");
          return;
        }

        await navigator.share({ title: `Receipt ${receipt.receiptNumber}`, text: shareText, url: shareUrl });
        toast.success("Receipt shared");
        return;
      }
    } catch (error) {
      const errorName = error instanceof Error ? error.name : "";
      if (errorName === "AbortError") {
        return;
      }
      toast.error("Native share failed. Opening WhatsApp fallback.");
    } finally {
      setSharing(false);
    }

    // Fallback: open WhatsApp directly
    handleWhatsApp();
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button type="button" variant="secondary" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      <Button type="button" variant="secondary" onClick={handleShare} disabled={sharing}>
        <Share2 className="mr-2 h-4 w-4" />
        {sharing ? "Sharing..." : "Share"}
      </Button>
      <Button type="button" variant="secondary" onClick={handleWhatsApp}>
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>
      <Button type="button" variant="secondary" onClick={handleCopyLink}>
        <Copy className="mr-2 h-4 w-4" />
        Copy Link
      </Button>
      <DownloadPdfButton {...props} />
    </div>
  );
}
