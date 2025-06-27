import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@workspace/ui/globals.css";
import { PaymasterProvider } from "@/context/PaymasterContext";
import { SmartAccountProvider } from "@/context/SmartAccountContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Counter DApp",
  description:
    "A simple counter DApp on Base Sepolia with anonymous gas coupons",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PaymasterProvider>
          <SmartAccountProvider>
            <div className="min-h-screen bg-background">
              <main className="container mx-auto px-4 py-8">{children}</main>
            </div>
          </SmartAccountProvider>
        </PaymasterProvider>
      </body>
    </html>
  );
}
