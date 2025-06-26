"use client";

import React from "react";
import { PaymentManager, type PaymentPool } from "@/components/payment";
import { PoolCard } from "@/lib/storage/indexed-db-storage";

/**
 * Props for PaymentModal component
 */
interface PaymentModalProps {
  /** Whether the modal is visible */
  isVisible: boolean;
  /** Pool data for payment processing */
  paymentPool: PaymentPool;
  /** Generated card to be activated */
  generatedCard: PoolCard;
  /** Pool ID for display */
  poolId: string;
  /** Handler for successful payment completion */
  onPaymentSuccess: (activatedCard: PoolCard) => void;
  /** Handler for payment errors */
  onPaymentError: (error: string) => void;
  /** Handler for canceling the payment */
  onCancel: () => void;
}

/**
 * Format wei amount to ETH display
 */
const formatEthAmount = (weiString: string): string => {
  try {
    const wei = BigInt(weiString);
    const eth = Number(wei) / 1e18;

    if (eth === 0) return "0.00";
    if (eth < 0.0001) return "< 0.0001";
    if (eth < 1) return eth.toFixed(6).replace(/\.?0+$/, "");
    return eth.toFixed(4).replace(/\.?0+$/, "");
  } catch {
    return "0.00";
  }
};

/**
 * PaymentModal Component
 *
 * Single Responsibility: Handle payment processing modal UI and interactions
 *
 * Features:
 * - Modal overlay with backdrop blur
 * - Payment amount display
 * - Integration with PaymentManager
 * - Payment callback handling
 * - Cancel functionality
 */
const PaymentModal: React.FC<PaymentModalProps> = ({
  isVisible,
  paymentPool,
  generatedCard,
  poolId,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}) => {
  if (!isVisible) return null;

  const handlePaymentCompleted = (details: any) => {
    console.log("Payment completed:", details);

    // Update card status and save
    const activatedCard: PoolCard = {
      ...generatedCard,
      status: "active",
      balance: formatEthAmount(paymentPool.joiningFee),
      joinedAt: new Date().toISOString(),
    };

    onPaymentSuccess(activatedCard);
  };

  const handlePaymentError = (error: any) => {
    onPaymentError(error.message);
  };

  const handlePaymentStarted = (paymentData: any) => {
    console.log("Payment started:", paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-600/50 rounded-2xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Complete Payment
          </h2>
          <p className="text-slate-400">
            Join Pool {poolId} with {formatEthAmount(paymentPool.joiningFee)}{" "}
            ETH
          </p>
        </div>

        <PaymentManager
          pool={paymentPool}
          card={generatedCard}
          callbacks={{
            onPaymentStarted: handlePaymentStarted,
            onPaymentCompleted: handlePaymentCompleted,
            onPaymentError: handlePaymentError,
          }}
        />

        <div className="text-center mt-6">
          <button onClick={onCancel} className="btn-prepaid-outline btn-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
