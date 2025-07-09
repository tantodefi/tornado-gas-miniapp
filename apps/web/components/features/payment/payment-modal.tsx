//file:prepaid-gas-website/apps/web/components/features/payment/payment-modal.tsx
"use client";

import { PaymentManager } from "@/components/features/payment/payment-manager";
import { PaymentPool, PoolCard, PaymentDetails } from "@/types";
import React from "react";
import { formatEther } from "viem";

/**
 * Props for PaymentModal component - UPDATED to include PaymentDetails
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
  /** Handler for successful payment completion - UPDATED to include PaymentDetails */
  onPaymentSuccess: (activatedCard: PoolCard, paymentDetails: PaymentDetails) => void;
  /** Handler for payment errors */
  onPaymentError: (error: string) => void;
  /** Handler for canceling the payment */
  onCancel: () => void;
}


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
            Join Pool {poolId} with {formatEther(BigInt(paymentPool.joiningFee))}{" "}
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