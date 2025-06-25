import { Metadata } from "next";
import { Suspense } from "react";
import TopUpFlow from "@/components/topup-flow";

export const metadata: Metadata = {
  title: "Top Up Gas Card - Prepaid Gas",
  description: "Add funds to your prepaid gas card for blockchain transactions",
};

/**
 * Top-up page content with search params handling
 */
function TopUpContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-prepaid-gradient flex items-center justify-center">
          <div className="text-white text-lg animate-pulse">
            <div className="text-6xl mb-4">⚡</div>
            <div className="text-xl">Loading Top-up...</div>
          </div>
        </div>
      }
    >
      <TopUpFlow />
    </Suspense>
  );
}

/**
 * Top-up page - /cards/topup
 * Supports query params: ?pool=123 or ?card=PGC-ABC123&pool=123
 */
export default function TopUpPage() {
  return <TopUpContent />;
}
