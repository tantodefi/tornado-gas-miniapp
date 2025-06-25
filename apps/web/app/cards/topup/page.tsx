import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Top Up Gas Card - Prepaid Gas",
  description: "Add funds to your prepaid gas card for blockchain transactions",
};

/**
 * Top-up page content with search params handling
 */
function TopUpContent() {
  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ✅ FIXED: Inline header (no event handler props) */}
        <div className="flex justify-between items-center mb-8">
          <a
            href="/pools"
            className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono"
          >
            ← Back to Pools
          </a>
          <div className="text-xs text-slate-500 font-mono">Top-up Flow</div>
        </div>

        <div className="text-center">
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="heading-prepaid-section mb-4">
            <span className="text-prepaid-gradient-white">Top-up </span>
            <span className="text-prepaid-gradient-brand">Flow</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            This is where the wallet connection and Ethereum transaction flow
            will be implemented.
          </p>

          {/* Future features preview */}
          <div className="mb-8 p-4 bg-slate-800/30 rounded-lg border border-slate-600/30 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-purple-400 mb-2">
              Coming Soon Features:
            </h3>
            <ul className="text-xs text-slate-400 space-y-1 text-left">
              <li>• Wallet connection (Rainbow, MetaMask, etc.)</li>
              <li>• Pool selection and joining</li>
              <li>• ETH/USDC payment processing</li>
              <li>• Transaction confirmation</li>
              <li>• Card activation flow</li>
            </ul>
          </div>

          {/* Action buttons - using links instead of onClick handlers */}
          <div className="flex gap-4 justify-center mb-8">
            <a
              href="/pools"
              className="btn-prepaid-outline btn-lg inline-block"
            >
              Back to Pools
            </a>
            <button className="btn-prepaid-primary btn-lg">
              Connect Wallet →
            </button>
          </div>

          {/* URL params preview for development */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 max-w-md mx-auto">
            <h4 className="text-xs font-bold text-slate-400 mb-2">
              URL Parameters Support:
            </h4>
            <div className="text-xs text-slate-500 font-mono text-left space-y-1">
              <div>• /cards/topup?pool=123 - Pre-select pool</div>
              <div>• /cards/topup?card=PG-ABC123 - Top-up existing card</div>
              <div>• Current URL will be parsed here</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Top-up page - /cards/topup
 * Pure Server Component - no event handlers
 * Supports query params: ?pool=123 or ?card=PG-ABC123
 */
export default function TopUpPage() {
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
      <TopUpContent />
    </Suspense>
  );
}
