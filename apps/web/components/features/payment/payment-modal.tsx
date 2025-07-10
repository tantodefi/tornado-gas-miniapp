//file:prepaid-gas-website/apps/web/components/features/payment/payment-modal.tsx

"use client";

import React from "react";
import { PaymentManager, PaymentSuccessDetails } from "./payment-manager";
import { formatEther } from "viem";
import { PoolCard } from "@/lib/storage/indexed-db";
import { Pool } from "@/types/pool";

interface PaymentModalProps {
  isVisible: boolean;
  pool: Pool;
  card: PoolCard;
  canCancel: boolean;
  onPaymentStarted: () => void;
  onPaymentSuccess: (details: PaymentSuccessDetails) => void;
  onPaymentError: (error: string) => void;
  onCancel?: () => void;
}

/**
 * Payment Modal Component
 * Single responsibility: Display payment UI and coordinate with PaymentManager
 */
function PaymentModal({
  isVisible,
  pool,
  card,
  canCancel,
  onPaymentStarted,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}: PaymentModalProps) {
  if (!isVisible) return null;

  const joiningFeeEth = formatEther(BigInt(pool.joiningFee));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-600/50 rounded-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Complete Payment
          </h2>
          <p className="text-slate-400">
            Join Pool {pool.poolId} with {joiningFeeEth} ETH
          </p>
        </div>

        {/* Payment Manager */}
        <PaymentManager
          pool={pool}
          card={card}
          callbacks={{
            onPaymentStarted,
            onPaymentSuccess,
            onPaymentError,
          }}
        />

        {/* Cancel Button */}
        <div className="text-center mt-6">
          {canCancel && onCancel ? (
            <button onClick={onCancel} className="btn-prepaid-outline btn-sm">
              Cancel
            </button>
          ) : (
            <button
              disabled
              className="btn-prepaid-outline btn-sm opacity-50 cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { PaymentModal };
