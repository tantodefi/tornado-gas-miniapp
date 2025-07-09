//file:prepaid-gas-website/apps/web/components/features/payment/payment-manager.tsx

"use client";

import { useCallback, useRef } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { encodeFunctionData } from "viem";
import { getPaymentProvider } from "@/components/providers/payment-provider-wrapper";
import { GAS_LIMITED_PAYMASTER_ABI } from "@workspace/core";
import { DaimoButton } from "./daimo-button";
import { RainbowButton } from "./rainbow-button";
import type {
  PaymentPool,
  PaymentData,
  PaymentDetails,
  PaymentError,
  PaymentManagerConfig,
  DaimoPaymentEvent,
  RainbowTransactionEvent,
  WagmiError,
  DaimoError,
  PoolCard,
} from "@/types";
/**
 * Hook for generating payment data using existing card identity
 * Unlike old system, this uses the identity from pending card
 */
export function usePaymentDataGenerator(pool: PaymentPool, card: PoolCard) {
  const generatePaymentData = useCallback((): PaymentData => {
    // Restore identity from existing card (not generate new one)
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

  return generatePaymentData;
}

/**
 * Main PaymentManager Component
 * Coordinates payment flow between Daimo and Rainbow providers
 */
export function PaymentManager({
  pool,
  card,
  provider = "auto",
  callbacks,
}: PaymentManagerConfig) {
  // Store payment data to use in success callback
  const currentPaymentDataRef = useRef<PaymentData | null>(null);

  // Determine which provider to use
  const actualProvider = provider === "auto" ? getPaymentProvider() : provider;

  // Payment data generator using existing card identity
  const getPaymentData = usePaymentDataGenerator(pool, card);

  // Handle payment started - store payment data for later use
  const handlePaymentStarted = useCallback(
    (paymentData: PaymentData) => {
      console.log("Payment started:", {
        poolId: pool.poolId,
        cardId: card.id,
        provider: actualProvider,
        identityCommitment: paymentData.identity.commitment.toString(),
      });

      // Store payment data for completion callback
      currentPaymentDataRef.current = paymentData;

      // Call external callback
      callbacks.onPaymentStarted(paymentData);
    },
    [pool.poolId, card.id, actualProvider, callbacks],
  );

  // Handle payment completed - create payment details for card activation
  const handlePaymentCompleted = useCallback(
    (event: DaimoPaymentEvent | RainbowTransactionEvent) => {
      console.log("Payment completed:", {
        event,
        poolId: pool.poolId,
        cardId: card.id,
        provider: actualProvider,
      });

      // Get stored payment data
      const paymentData = currentPaymentDataRef.current;

      if (!paymentData) {
        console.error("No payment data found for success callback");
        const error: PaymentError = {
          message: "Payment completed but missing payment data",
          provider: actualProvider,
          poolId: pool.poolId,
          cardId: card.id,
          timestamp: Date.now(),
        };
        callbacks.onPaymentError(error);
        return;
      }

      // Extract transaction hash from different event types
      let transactionHash: string | undefined;
      let blockNumber: number | undefined;
      let gasUsed: string | undefined;

      // Type guard for Rainbow event
      if ("hash" in event && typeof event.hash === "string") {
        // Rainbow/Wagmi event
        transactionHash = event.hash;
        if ("blockNumber" in event && typeof event.blockNumber === "number") {
          blockNumber = event.blockNumber;
        }
        if ("gasUsed" in event && typeof event.gasUsed === "string") {
          gasUsed = event.gasUsed;
        }
      } else {
        // Daimo event - try different hash properties
        if (
          "transactionHash" in event &&
          typeof event.transactionHash === "string"
        ) {
          transactionHash = event.transactionHash;
        } else if ("txHash" in event && typeof event.txHash === "string") {
          transactionHash = event.txHash;
        }
      }

      // Validate that we have a transaction hash
      if (!transactionHash) {
        console.error("No transaction hash found in payment event:", event);
        const error: PaymentError = {
          message: "Payment completed but no transaction hash received",
          provider: actualProvider,
          poolId: pool.poolId,
          cardId: card.id,
          timestamp: Date.now(),
          cause: event,
        };
        callbacks.onPaymentError(error);
        return;
      }

      console.log("✅ Transaction hash extracted:", transactionHash);

      // 🔧 FIX: Create PaymentDetails with correct network structure
      const paymentDetails: PaymentDetails = {
        transactionHash,
        pool,
        card,
        network: {
          name: pool.network,
          chainId: pool.chainId,
        },
        timestamp: Date.now(),
        blockNumber,
        gasUsed,
      };

      console.log("✅ PaymentDetails created:", {
        transactionHash: paymentDetails.transactionHash,
        network: paymentDetails.network,
        cardId: paymentDetails.card.id,
      });

      // Call success callback with complete details
      callbacks.onPaymentCompleted(paymentDetails);
    },
    [pool, card, actualProvider, callbacks],
  );

  // Handle payment error - create standardized error
  const handlePaymentError = useCallback(
    (error: DaimoError | WagmiError | unknown) => {
      console.log("Payment error:", {
        error,
        poolId: pool.poolId,
        cardId: card.id,
        provider: actualProvider,
      });

      // Clear stored payment data on error
      currentPaymentDataRef.current = null;

      // Extract error message for user display
      let errorMessage = "Payment failed. Please try again.";

      if (error && typeof error === "object") {
        if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        } else if ("error" in error && typeof error.error === "string") {
          errorMessage = error.error;
        } else if ("status" in error) {
          errorMessage = `Payment ${error.status || "failed"}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      const paymentError: PaymentError = {
        message: errorMessage,
        provider: actualProvider,
        poolId: pool.poolId,
        cardId: card.id,
        timestamp: Date.now(),
        cause: error,
      };

      callbacks.onPaymentError(paymentError);
    },
    [pool.poolId, card.id, actualProvider, callbacks],
  );

  // Unified callbacks for payment buttons
  const paymentCallbacks = {
    handlePaymentStarted,
    handlePaymentCompleted,
    handlePaymentError,
  };

  console.log("PaymentManager: Using provider:", actualProvider);

  // Render appropriate payment button based on provider
  return (
    <div className="w-full flex flex-col items-center">
      {actualProvider === "daimo" ? (
        <DaimoButton
          pool={pool}
          card={card}
          getPaymentData={getPaymentData}
          callbacks={paymentCallbacks}
        />
      ) : (
        <RainbowButton
          pool={pool}
          card={card}
          getPaymentData={getPaymentData}
          callbacks={paymentCallbacks}
        />
      )}
    </div>
  );
}
