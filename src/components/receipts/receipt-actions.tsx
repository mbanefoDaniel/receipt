"use client";

import { Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadPdfButton } from "@/components/receipts/download-pdf-button";

type ReceiptActionsProps = React.ComponentProps<typeof DownloadPdfButton>;

export function ReceiptActions(props: ReceiptActionsProps) {
  const { receipt, settings, verifyUrl } = props;

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
    const text =
      `🧾 *Receipt from ${settings.businessName}*\n` +
      `Customer: ${receipt.customer.name}\n` +
      `Amount: ₦${receipt.total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}\n` +
      `Verify: ${verifyUrl}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `Receipt ${receipt.receiptNumber}`, text });
        return;
      } catch {
        // user cancelled or share failed — fall through to WhatsApp link
      }
    }

    // Fallback: open WhatsApp directly
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button type="button" variant="secondary" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      <Button type="button" variant="secondary" onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
      <DownloadPdfButton {...props} />
    </div>
  );
}
