//file:prepaid-gas-website/apps/web/components/features/payment/daimo-button.tsx

"use client";

import { useState, useCallback } from "react";
import { DaimoPayButton } from "@daimo/pay";
import { base } from "viem/chains";
import { zeroAddress } from "viem";
import type {
  PaymentData,
  PaymentButtonProps,
  DaimoPaymentEvent,
  DaimoError,
} from "@/types";
import { formatJoiningFee } from "@/utils";

/**
 * DaimoButton component for seamless crypto payments
 * Adapted for current pool/card system
 */
export function DaimoButton({
  pool,
  card,
  getPaymentData,
  callbacks,
}: PaymentButtonProps) {
  const [currentPaymentData, setCurrentPaymentData] =
    useState<PaymentData | null>(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  // 🔧 FIX: Handle payment started - but don't call callback immediately
  const handlePaymentStarted = useCallback(
    (event: unknown) => {
      console.log("🚀 Daimo payment initiated:", event);

      try {
        const paymentData = getPaymentData();
        setCurrentPaymentData(paymentData);
        setPaymentInProgress(true);

        // 🔧 FIX: Delay calling onPaymentStarted to simulate confirmation timing
        // Daimo might handle confirmation internally, so we delay slightly
        setTimeout(() => {
          console.log(
            "🔐 Daimo payment confirmation - calling onPaymentStarted",
          );
          callbacks.handlePaymentStarted(paymentData);
        }, 100); // Small delay to ensure cancel button timing is correct
      } catch (error) {
        setPaymentInProgress(false);
        const daimoError: DaimoError = {
          message:
            error instanceof Error
              ? error.message
              : "Payment data generation failed",
          name: error instanceof Error ? error.name : "UnknownError",
          cause: error,
        };
        callbacks.handlePaymentError(daimoError);
      }
    },
    [getPaymentData, callbacks],
  );

  // Handle payment completed - pass through with payment data context
  const handlePaymentCompleted = useCallback(
    (event: DaimoPaymentEvent) => {
      console.log("✅ Daimo payment completed:", event);
      setPaymentInProgress(false);

      // Daimo might pass different event structure
      // Extract transaction hash from various possible locations
      let transactionHash = "";
      if (event?.transactionHash) {
        transactionHash = event.transactionHash;
      } else if (event?.hash) {
        transactionHash = event.hash;
      } else if (event?.txHash) {
        transactionHash = event.txHash;
      }

      const enhancedEvent: DaimoPaymentEvent = {
        ...event,
        hash: transactionHash,
        transactionHash: transactionHash,
        paymentData: currentPaymentData,
      };

      callbacks.handlePaymentCompleted(enhancedEvent);
    },
    [callbacks, currentPaymentData],
  );

  // 🔧 FIX: Handle payment bounced/cancelled
  const handlePaymentBounced = useCallback(
    (event: unknown) => {
      console.log("🚫 Daimo payment bounced/cancelled:", event);
      setPaymentInProgress(false);

      const daimoError: DaimoError = {
        message: "Payment was cancelled or rejected",
        name: "PaymentBounced",
        cause: event,
      };
      callbacks.handlePaymentError(daimoError);
    },
    [callbacks],
  );

  // Generate payment data for metadata
  const handleGetPaymentData = () => {
    try {
      return getPaymentData();
    } catch (error) {
      const daimoError: DaimoError = {
        message:
          error instanceof Error
            ? error.message
            : "Payment data generation failed",
        name: error instanceof Error ? error.name : "UnknownError",
        cause: error,
      };
      callbacks.handlePaymentError(daimoError);
      return null;
    }
  };

  const paymentData = handleGetPaymentData();

  if (!paymentData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-sm text-slate-400">
          Error generating payment data...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DaimoPayButton
        // Required props
        appId={process.env.NEXT_PUBLIC_DAIMO_APP_ID || "pay-demo"}
        toAddress={pool.paymaster.address as `0x${string}`}
        toChain={base.id}
        toUnits={formatJoiningFee(pool.joiningFee)}
        toToken={zeroAddress} // ETH
        // toCallData={paymentData.calldata} // Uncomment if Daimo supports calldata

        // Tracking & Metadata
        metadata={{
          poolId: pool.poolId,
          cardId: card.id,
          purchaseTimestamp: Date.now().toString(),
          identityCommitment: paymentData.identity.commitment.toString(),
        }}
        // Optional customization
        intent="Join Gas Pool"
        // Behavior
        closeOnSuccess={true}
        resetOnSuccess={false}
        // 🔧 FIX: Event handlers with proper timing
        onPaymentStarted={handlePaymentStarted}
        onPaymentCompleted={handlePaymentCompleted}
        onPaymentBounced={handlePaymentBounced}
      />

      <div className="text-center">
        <p className="text-xs text-slate-400">
          Powered by{" "}
          <span className="font-medium text-purple-400">DaimoPay</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {paymentInProgress
            ? "Processing payment..."
            : "Pay with Coinbase, Binance, or any wallet"}
        </p>

        {/* Show current payment info for debugging */}
        {currentPaymentData && (
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Card: {currentPaymentData.cardId} • Pool:{" "}
            {currentPaymentData.poolId}
            {paymentInProgress && " • In Progress"}
          </p>
        )}
      </div>
    </div>
  );
}
