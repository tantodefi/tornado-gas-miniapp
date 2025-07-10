//file:prepaid-gas-website/apps/web/components/features/payment/payment-manager.tsx

"use client";

import { useCallback } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { encodeFunctionData } from "viem";
import { getPaymentProvider } from "@/components/providers/payment-provider-wrapper";
import { GAS_LIMITED_PAYMASTER_ABI } from "@workspace/core";
import { DaimoButton } from "./daimo-button";
import { RainbowButton } from "./rainbow-button";
import { PoolCard } from "@/lib/storage/indexed-db";
import { Pool } from "@/types/pool";

// Payment data structure
interface PaymentData {
  calldata: `0x${string}`;
  identity: Identity;
  poolId: string;
  cardId: string;
}

// Success details from payment
interface PaymentSuccessDetails {
  transactionHash: string;
  pool: Pool;
  card: PoolCard;
  network: {
    name: string;
    chainId: string;
  };
}

// Payment callbacks interface
interface PaymentCallbacks {
  onPaymentStarted: () => void;
  onPaymentSuccess: (details: PaymentSuccessDetails) => void;
  onPaymentError: (error: string) => void;
}

// Props for payment manager
interface PaymentManagerProps {
  pool: Pool;
  card: PoolCard;
  callbacks: PaymentCallbacks;
}

/**
 * Generate payment data from card's identity
 */
function usePaymentDataGenerator(pool: Pool, card: PoolCard) {
  return useCallback((): PaymentData => {
    // Use existing card identity
    const identity = new Identity(card.identity.privateKey);

    // Generate calldata for addMember function
    const calldata = encodeFunctionData({
      abi: GAS_LIMITED_PAYMASTER_ABI,
      functionName: "addMember",
      args: [BigInt(pool.poolId), identity.commitment],
    });

    return {
      calldata,
      identity,
      poolId: pool.poolId,
      cardId: card.id,
    };
  }, [pool.poolId, card.identity.privateKey, card.id]);
}

/**
 * Payment Manager Component
 */
function PaymentManager({ pool, card, callbacks }: PaymentManagerProps) {
  const provider = getPaymentProvider();
  const getPaymentData = usePaymentDataGenerator(pool, card);

  // Unified callback handlers for provider buttons
  const handlePaymentStarted = useCallback(() => {
    console.log(`🔐 Payment started for card: ${card.id}`);
    callbacks.onPaymentStarted();
  }, [card.id, callbacks]);

  const handlePaymentSuccess = useCallback(
    (transactionHash: string) => {
      console.log(`✅ Payment completed: ${transactionHash}`);

      const successDetails: PaymentSuccessDetails = {
        transactionHash,
        pool,
        card,
        network: {
          name: pool.network,
          chainId: pool.chainId,
        },
      };

      callbacks.onPaymentSuccess(successDetails);
    },
    [pool, card, callbacks],
  );

  const handlePaymentError = useCallback(
    (errorMessage: string) => {
      console.log(`❌ Payment failed: ${errorMessage}`);
      callbacks.onPaymentError(errorMessage);
    },
    [callbacks],
  );

  // Render appropriate payment button
  if (provider === "daimo") {
    return (
      <DaimoButton
        pool={pool}
        card={card}
        getPaymentData={getPaymentData}
        onPaymentStarted={handlePaymentStarted}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    );
  }

  return (
    <RainbowButton
      pool={pool}
      card={card}
      getPaymentData={getPaymentData}
      onPaymentStarted={handlePaymentStarted}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentError={handlePaymentError}
    />
  );
}

export { PaymentManager };
export type { PaymentData, PaymentSuccessDetails };
