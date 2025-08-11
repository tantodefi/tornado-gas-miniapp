//file:tornado-gas-miniapp/apps/web/components/features/payment/daimo-button.tsx

"use client";

import { useState } from "react";
import { DaimoPayButton } from "@daimo/pay";
import { base } from "viem/chains";
import { zeroAddress } from "viem";
import { formatJoiningFee } from "@/utils";
import { PoolCard } from "@/lib/storage/indexed-db";
import { PaymentData } from "./payment-manager";
import { Pool } from "@/types/pool";
import { useFarcaster } from "../../../context/farcaster/FarcasterProvider";

// Daimo payment event
interface DaimoPaymentEvent {
  transactionHash?: string;
  hash?: string;
  txHash?: string;
  success?: boolean;
}

interface DaimoButtonProps {
  pool: Pool;
  card: PoolCard;
  getPaymentData: () => PaymentData;
  onPaymentStarted: () => void;
  onPaymentSuccess: (transactionHash: string) => void;
  onPaymentError: (error: string) => void;
}

/**
 * Daimo payment button
 */
function DaimoButton({
  pool,
  card,
  getPaymentData,
  onPaymentStarted,
  onPaymentSuccess,
  onPaymentError,
}: DaimoButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user: fcUser, isAuthenticated: fcAuthenticated } = useFarcaster();

  // Handle payment started
  const handlePaymentStarted = () => {
    setIsProcessing(true);
    onPaymentStarted();
  };

  // Handle payment completed
  const handlePaymentCompleted = (event: DaimoPaymentEvent) => {
    setIsProcessing(false);

    // Extract transaction hash from event
    const transactionHash = event.transactionHash || event.hash || event.txHash;

    if (!transactionHash) {
      onPaymentError("Payment completed but no transaction hash received");
      return;
    }

    onPaymentSuccess(transactionHash);
  };

  // Handle payment error/cancelled
  const handlePaymentBounced = () => {
    setIsProcessing(false);
    onPaymentError("Payment was cancelled or rejected");
  };

  // Generate payment data for metadata
  const paymentData = (() => {
    try {
      return getPaymentData();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment data generation failed";
      onPaymentError(errorMessage);
      return null;
    }
  })();

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
        toAddress={pool.address as `0x${string}`}
        toChain={base.id}
        toUnits={formatJoiningFee(pool.joiningAmount)}
        toToken={zeroAddress}
        // Tracking & Metadata - Include Farcaster context
        metadata={{
          poolId: pool.address,
          cardId: card.id,
          purchaseTimestamp: Date.now().toString(),
          // Farcaster user context for Mini App
          ...(fcAuthenticated &&
            fcUser && {
              farcasterFid: fcUser.fid.toString(),
              farcasterUsername: fcUser.username || fcUser.displayName,
              source: "tornado-gas-miniapp",
            }),
        }}
        // Optional customization - Enhanced for Mini App
        intent={`Join Tornado Gas Pool ${fcUser ? `(${fcUser.displayName || fcUser.username || `FID ${fcUser.fid}`})` : ""}`}
        closeOnSuccess={true}
        resetOnSuccess={false}
        // Event handlers
        onPaymentStarted={handlePaymentStarted}
        onPaymentCompleted={handlePaymentCompleted}
        onPaymentBounced={handlePaymentBounced}
      />

      <div className="text-center">
        <p className="text-xs text-slate-400">
          Powered by{" "}
          <span className="font-medium text-purple-400">DaimoPay</span>
          {fcAuthenticated && fcUser && (
            <span className="ml-2">• 🌪️ Tornado Gas Mini App</span>
          )}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {isProcessing
            ? "Processing payment..."
            : "Pay with Coinbase, Binance, or any wallet"}
        </p>
        {fcAuthenticated && fcUser && (
          <p className="text-xs text-slate-500 mt-1">
            Joining as{" "}
            {fcUser.displayName || fcUser.username || `FID ${fcUser.fid}`}
          </p>
        )}
      </div>
    </div>
  );
}

export { DaimoButton };
