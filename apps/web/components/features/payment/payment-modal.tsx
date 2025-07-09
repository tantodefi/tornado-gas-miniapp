//file:prepaid-gas-website/apps/web/components/features/payment/payment-modal.tsx
"use client";

import { PaymentManager } from "@/components/features/payment/payment-manager";
import { PaymentPool, PoolCard, PaymentDetails, PaymentData } from "@/types";
import React from "react";
import { formatEther } from "viem";

/**
 * Props for PaymentModal component - UPDATED to include PaymentDetails
 */
export interface PaymentModalProps {
  isVisible: boolean;
  paymentPool: PaymentPool;
  generatedCard: PoolCard;
  poolId: string;
  onPaymentSuccess: (
    activatedCard: PoolCard,
    paymentDetails: PaymentDetails,
  ) => void;
  onPaymentError: (error: string) => void;
  onCancel?: () => void;
  onPaymentStarted: (paymentData: PaymentData) => void;
}

/**
 * PaymentModal Component
 */
const PaymentModal: React.FC<PaymentModalProps> = ({
  isVisible,
  paymentPool,
  generatedCard,
  poolId,
  onPaymentSuccess,
  onPaymentStarted,
  onPaymentError,
  onCancel,
}) => {
  if (!isVisible) return null;

  const handlePaymentCompleted = (details: PaymentDetails) => {
    console.log("Payment completed in modal:", {
      transactionHash: details.transactionHash,
      network: details.network,
      cardId: details.card.id,
    });

    // Update card status and save
    const activatedCard: PoolCard = {
      ...generatedCard,
      status: "active",
      balance: formatEther(BigInt(paymentPool.joiningFee)),
      purchasedAt: new Date().toISOString(),
    };

    console.log("Calling onPaymentSuccess with:", {
      activatedCardId: activatedCard.id,
      detailsTransactionHash: details.transactionHash,
    });

    // UPDATED: Pass both activatedCard AND PaymentDetails
    onPaymentSuccess(activatedCard, details);
  };

  const handlePaymentError = (error: any) => {
    onPaymentError(error.message);
  };

  // 🔧 FIX: Determine if cancel is allowed
  const canCancel = !!onCancel;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-600/50 rounded-2xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Complete Payment
          </h2>
          <p className="text-slate-400">
            Join Pool {poolId} with{" "}
            {formatEther(BigInt(paymentPool.joiningFee))} ETH
          </p>
        </div>

        <PaymentManager
          pool={paymentPool}
          card={generatedCard}
          callbacks={{
            onPaymentStarted: onPaymentStarted,
            onPaymentCompleted: handlePaymentCompleted,
            onPaymentError: handlePaymentError,
          }}
        />

        <div className="text-center mt-6">
          {/* 🔧 FIX: Only show cancel button when cancellation is allowed */}
          {canCancel ? (
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
};

export default PaymentModal;
