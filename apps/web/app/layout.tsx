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
  title: "Tornado Gas Mini App",
  description:
    "Anonymous gas payments through prepaid pools. Pay upfront, spend privately with zero-knowledge proofs.",
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://tornado-gas-miniapp.vercel.app/embed-image.png",
      button: {
        title: "🌪️ Tornado Gas",
        action: {
          type: "launch",
          url: "https://tornado-gas-miniapp.vercel.app",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://auth.farcaster.xyz" />
      </head>
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
