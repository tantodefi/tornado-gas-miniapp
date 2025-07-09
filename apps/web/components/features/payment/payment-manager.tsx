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
 * Unlike old system, this uses the identity from existing card
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
      console.log("🔐 PaymentManager: Payment started:", {
        poolId: pool.poolId,
        cardId: card.id,
        provider: actualProvider,
        identityCommitment: paymentData.identity.commitment.toString(),
        timing: "wallet_confirmation_dialog_appeared",
      });

      // Store payment data for completion callback
      currentPaymentDataRef.current = paymentData;

      // 🔧 FIX: Ensure callback is called properly
      try {
        callbacks.onPaymentStarted(paymentData);
        console.log("✅ PaymentManager: onPaymentStarted callback completed");
      } catch (error) {
        console.error(
          "❌ PaymentManager: Error in onPaymentStarted callback:",
          error,
        );
        // Don't fail the payment flow for callback errors
      }
    },
    [pool.poolId, card.id, actualProvider, callbacks],
  );

  // Handle payment completed - create payment details for card activation
  const handlePaymentCompleted = useCallback(
    (event: DaimoPaymentEvent | RainbowTransactionEvent) => {
      console.log("✅ PaymentManager: Payment completed:", {
        event,
        poolId: pool.poolId,
        cardId: card.id,
        provider: actualProvider,
      });

      // 🔧 FIX: Better validation of payment data
      const paymentData = currentPaymentDataRef.current;

      if (!paymentData) {
        console.error(
          "❌ PaymentManager: No payment data found for success callback",
        );
        const error: PaymentError = {
          message:
            "Payment completed but missing payment data. This may indicate a timing issue.",
          provider: actualProvider,
          poolId: pool.poolId,
          cardId: card.id,
          timestamp: Date.now(),
          cause: new Error("Missing payment data in success callback"),
        };
        callbacks.onPaymentError(error);
        return;
      }

      // Extract transaction hash from different event types
      let transactionHash: string | undefined;
      let blockNumber: number | undefined;
      let gasUsed: string | undefined;

      // 🔧 IMPROVED: More robust hash extraction
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
        console.error(
          "❌ PaymentManager: No transaction hash found in payment event:",
          event,
        );
        const error: PaymentError = {
          message:
            "Payment completed but no transaction hash received. Please contact support.",
          provider: actualProvider,
          poolId: pool.poolId,
          cardId: card.id,
          timestamp: Date.now(),
          cause: event,
        };
        callbacks.onPaymentError(error);
        return;
      }

      console.log(
        "✅ PaymentManager: Transaction hash extracted:",
        transactionHash,
      );

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

      console.log("✅ PaymentManager: PaymentDetails created:", {
        transactionHash: paymentDetails.transactionHash,
        network: paymentDetails.network,
        cardId: paymentDetails.card.id,
      });

      // 🔧 FIX: Clear payment data before calling success callback
      currentPaymentDataRef.current = null;

      // Call success callback with complete details
      try {
        callbacks.onPaymentCompleted(paymentDetails);
        console.log("✅ PaymentManager: onPaymentCompleted callback completed");
      } catch (error) {
        console.error(
          "❌ PaymentManager: Error in onPaymentCompleted callback:",
          error,
        );
        // Convert callback error to payment error
        const paymentError: PaymentError = {
          message:
            "Payment succeeded but failed to process completion. Please check your cards.",
          provider: actualProvider,
          poolId: pool.poolId,
          cardId: card.id,
          timestamp: Date.now(),
          cause: error,
        };
        callbacks.onPaymentError(paymentError);
      }
    },
    [pool, card, actualProvider, callbacks],
  );

  // Handle payment error - create standardized error
  const handlePaymentError = useCallback(
    (error: DaimoError | WagmiError | unknown) => {
      console.log("❌ PaymentManager: Payment error:", {
        error,
        poolId: pool.poolId,
        cardId: card.id,
        provider: actualProvider,
      });

      // 🔧 FIX: Always clear stored payment data on error
      const hadPaymentData = currentPaymentDataRef.current !== null;
      currentPaymentDataRef.current = null;

      // Extract error message for user display
      let errorMessage = "Payment failed. Please try again.";

      // 🔧 IMPROVED: Better error message extraction
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

      console.log("🔧 PaymentManager: Created standardized error:", {
        message: paymentError.message,
        provider: paymentError.provider,
        hadPaymentData,
      });

      // 🔧 FIX: Ensure callback is called properly
      try {
        callbacks.onPaymentError(paymentError);
        console.log("✅ PaymentManager: onPaymentError callback completed");
      } catch (callbackError) {
        console.error(
          "❌ PaymentManager: Error in onPaymentError callback:",
          callbackError,
        );
        // Can't really handle this - just log it
      }
    },
    [pool.poolId, card.id, actualProvider, callbacks],
  );

  // 🔧 FIX: Unified callbacks for payment buttons (consistent interface)
  const paymentCallbacks = {
    handlePaymentStarted,
    handlePaymentCompleted,
    handlePaymentError,
  };

  console.log("🎯 PaymentManager: Using provider:", actualProvider, {
    poolId: pool.poolId,
    cardId: card.id,
  });

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
