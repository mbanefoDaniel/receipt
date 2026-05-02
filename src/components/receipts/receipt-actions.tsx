"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadPdfButton } from "@/components/receipts/download-pdf-button";

type ReceiptActionsProps = React.ComponentProps<typeof DownloadPdfButton>;

export function ReceiptActions(props: ReceiptActionsProps) {
  function handlePrint() {
    const target = document.querySelector("[data-receipt-print]") as HTMLElement | null;

    if (!target) {
      window.print();
      return;
    }

    const popup = window.open("", "_blank", "width=900,height=1200");
    if (!popup) {
      window.print();
      return;
    }

    popup.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Print Receipt</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 16px;
              font-family: Manrope, "Segoe UI", Arial, sans-serif;
              font-size: 13px;
              color: #0f172a;
              background: #ffffff;
            }

            .receipt-root {
              margin: 0 auto;
              max-width: 820px;
              border: 1px solid #e2e8f0;
              border-radius: 18px;
              overflow: hidden;
              background: #ffffff;
            }

            /* header section */
            .receipt-root > div:first-child {
              border-bottom: 1px solid #e2e8f0;
              background: #f8fafc;
              padding: 20px 24px;
            }

            /* content section */
            .receipt-root > div:last-child {
              padding: 20px 24px;
            }

            h3 { margin: 0; font-size: 26px; letter-spacing: -0.02em; }
            p  { margin: 2px 0; line-height: 1.4; }

            /* info cards (customer, issued, notes, warranty, totals, verify) */
            .rounded-xl {
              border-radius: 12px;
              border: 1px solid #e2e8f0;
              background: #f8fafc;
              padding: 14px 16px;
              margin-bottom: 12px;
            }

            /* layout grids — flatten to stacked for print */
            .grid { display: block; }

            /* contact chips */
            .flex { display: flex; }
            .flex-wrap { flex-wrap: wrap; }
            .gap-x-4 { column-gap: 16px; }
            .gap-y-1 { row-gap: 4px; }
            .items-center { align-items: center; }
            .gap-1\\.5 { gap: 6px; }
            .shrink-0 { flex-shrink: 0; }

            /* typography */
            .font-semibold { font-weight: 600; }
            .font-medium   { font-weight: 500; }
            .text-xs       { font-size: 11px; }
            .text-sm       { font-size: 12px; }
            .text-lg       { font-size: 16px; }
            .uppercase     { text-transform: uppercase; }
            .tracking-wide { letter-spacing: 0.05em; }
            .text-muted-foreground { color: #64748b; }
            .text-primary  { color: #3b82f6; }
            .italic        { font-style: italic; }

            /* table */
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              border-radius: 12px;
              overflow: hidden;
            }
            thead tr { background: #0f172a; color: #ffffff; }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 10px 14px;
              text-align: left;
              font-size: 12px;
            }
            td:last-child, th:last-child { text-align: right; }
            tbody tr:nth-child(odd) { background: #f8fafc; }

            /* totals row */
            .border-t { border-top: 1px solid #e2e8f0; }
            .pt-2 { padding-top: 8px; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            .justify-between { justify-content: space-between; }

            /* QR + verify row */
            img { max-width: 100%; height: auto; object-fit: contain; }

            /* hide buttons */
            button, a[href] { }
            .print\\:hidden { display: none !important; }

            @media print {
              body { padding: 0; }
              .receipt-root { border: 0; border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-root">${target.innerHTML}</div>
        </body>
      </html>
    `);
    popup.document.close();

    popup.onload = () => {
      popup.focus();
      popup.print();
      popup.onafterprint = () => popup.close();
    };
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
