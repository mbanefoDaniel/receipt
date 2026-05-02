import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "@/app/globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: {
    default: "Internal Receipt Generator",
    template: "%s | Internal Receipt Generator"
  },
  description: "Generate, print, and verify premium business receipts.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={manrope.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
