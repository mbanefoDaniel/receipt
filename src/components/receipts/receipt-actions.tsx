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
              padding: 0;
              font-family: Manrope, "Segoe UI", Arial, sans-serif;
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

            .receipt-root > div:first-child {
              border-bottom: 1px solid #e2e8f0;
              background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
              padding: 20px;
            }

            .receipt-root > div:last-child {
              padding: 20px;
            }

            h3 {
              margin: 0;
              font-size: 26px;
              letter-spacing: -0.02em;
            }

            p {
              margin: 2px 0;
              line-height: 1.35;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              border-radius: 12px;
              overflow: hidden;
            }

            thead tr {
              background: #0f172a;
              color: #ffffff;
            }

            th,
            td {
              border: 1px solid #e2e8f0;
              padding: 10px 12px;
              text-align: left;
              font-size: 13px;
            }

            tbody tr:nth-child(odd) {
              background: #f8fafc;
            }

            img {
              max-width: 100%;
              height: auto;
              object-fit: contain;
            }

            @media print {
              .receipt-root {
                border: 0;
                border-radius: 0;
              }
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
