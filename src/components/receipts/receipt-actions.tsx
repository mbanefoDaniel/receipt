"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadPdfButton } from "@/components/receipts/download-pdf-button";

type ReceiptActionsProps = React.ComponentProps<typeof DownloadPdfButton>;

export function ReceiptActions(props: ReceiptActionsProps) {
  function handlePrint() {
    const style = document.createElement("style");
    style.id = "__receipt-print-style__";
    style.innerHTML = `
      @media print {
        body > *:not(#__receipt-print-root__) { display: none !important; }
        #__receipt-print-root__ { display: block !important; }
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

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button type="button" variant="secondary" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      <DownloadPdfButton {...props} />
    </div>
  );
}
