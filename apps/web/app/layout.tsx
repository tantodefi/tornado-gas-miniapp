//file:prepaid-gas-website/apps/web/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@workspace/ui/components/sonner";

import "@workspace/ui/globals.css";
import { PaymentProviderWrapper } from "@/components/providers/payment-provider-wrapper";
import { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prepaid Gas Cards",
  description: "Prepaid Gas Cards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <PaymentProviderWrapper>
          <div className="relative z-10">{children}</div>
          <Toaster richColors />
        </PaymentProviderWrapper>
      </body>
    </html>
  );
}
