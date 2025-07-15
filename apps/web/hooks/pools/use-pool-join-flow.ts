//file:prepaid-gas-website/apps/web/hooks/pools/use-pool-join-flow.ts

import { useState, useCallback } from "react";
import { generateCompleteIdentity } from "@/lib/identity/generator";
import {
  saveCard,
  markCardAsCompleted,
  deleteCard,
  PoolCard,
} from "@/lib/storage/indexed-db";
import { encodePaymasterContext } from "@prepaid-gas/core";
import { Pool } from "@/types/pool";
import { PaymentSuccessDetails } from "@/components/features/payment/payment-manager";

// Join flow states - simple state machine
type JoinFlowState =
  | "idle"
  | "preparing"
  | "ready-for-payment"
  | "payment-in-progress"
  | "success"
  | "error";

interface UsePoolJoinFlowResult {
  // State
  state: JoinFlowState;
  generatedCard: PoolCard | null;
  completedCard: PoolCard | null;
  error: string | null;

  // Computed state
  canCancel: boolean;
  showPaymentModal: boolean;
  showSuccessModal: boolean;

  // Actions
  startJoinFlow: () => Promise<void>;
  onPaymentStarted: () => void;
  onPaymentSuccess: (details: PaymentSuccessDetails) => Promise<void>;
  onPaymentError: (error: string) => Promise<void>;
  onPaymentCancelled: () => Promise<void>;
  onSuccessComplete: () => void;
  reset: () => void;
}

/**
 * Hook for managing pool join flow state
 * Single responsibility: Coordinate the join flow from start to finish
 */
function usePoolJoinFlow(pool: Pool | null): UsePoolJoinFlowResult {
  const [state, setState] = useState<JoinFlowState>("idle");
  const [generatedCard, setGeneratedCard] = useState<PoolCard | null>(null);
  const [completedCard, setCompletedCard] = useState<PoolCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clean up pending card from storage
   */
  const cleanupPendingCard = useCallback(
    async (cardId: string): Promise<void> => {
      try {
        await deleteCard(cardId);
        console.log(`✅ Cleaned up pending card: ${cardId}`);
      } catch (error) {
        console.error(`❌ Failed to cleanup card ${cardId}:`, error);
      }
    },
    [],
  );

  /**
   * Start the join flow - generate identity and prepare payment
   */
  const startJoinFlow = useCallback(async () => {
    if (!pool || (state !== "idle" && state !== "error")) return;

    try {
      setState("preparing");
      setError(null);
      console.log(`🚀 Starting join flow for pool: ${pool.poolId}`);

      // Generate identity
      const { cardId, identity, mnemonic, privateKey } =
        generateCompleteIdentity();

      // Generate paymaster context
      const paymasterContext = encodePaymasterContext(
        pool.paymaster.address as `0x${string}`,
        pool.poolId,
        identity.export(),
      );

      // Create pending card
      const newCard: PoolCard = {
        id: cardId,
        poolInfo: {
          poolId: pool.poolId,
          joiningFee: pool.joiningFee,
          network: pool.network,
          paymasterType: pool.paymaster.contractType,
        },
        identity: {
          mnemonic,
          privateKey,
        },
        paymasterContract: pool.paymaster.address,
        paymasterContext,
        transactionHash: "",
        chainId: pool.chainId,
        purchasedAt: new Date().toISOString(),
        paymentStatus: "pending",
      };

      // Save pending card
      await saveCard(newCard);
      setGeneratedCard(newCard);
      setState("ready-for-payment");

      console.log(`✅ Join flow prepared, card ID: ${cardId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Join flow preparation failed:`, error);
      setError(`Failed to prepare join: ${errorMessage}`);
      setState("error");
    }
  }, [pool, state]);

  /**
   * Mark payment as started (wallet confirmation dialog appeared)
   */
  const onPaymentStarted = useCallback(() => {
    if (state === "ready-for-payment") {
      setState("payment-in-progress");
      console.log(`🔐 Payment started for card: ${generatedCard?.id}`);
    }
  }, [state, generatedCard?.id]);

  /**
   * Handle successful payment
   */
  const onPaymentSuccess = useCallback(
    async (details: PaymentSuccessDetails) => {
      if (!generatedCard) {
        console.error(`❌ No generated card for payment success`);
        setError("Payment succeeded but card is missing");
        setState("error");
        return;
      }

      try {
        console.log(`✅ Payment successful: ${details.transactionHash}`);

        // Mark card as completed in storage
        const updatedCard = await markCardAsCompleted(
          generatedCard.id,
          details.transactionHash,
        );

        if (!updatedCard) {
          throw new Error("Failed to update card status");
        }

        setCompletedCard(updatedCard);
        setState("success");
        console.log(`🎉 Card completed: ${updatedCard.id}`);
      } catch (error) {
        console.error(`❌ Failed to complete card:`, error);
        setError("Payment succeeded but failed to save card");
        setState("error");
      }
    },
    [generatedCard],
  );

  /**
   * Handle payment error
   */
  const onPaymentError = useCallback(
    async (errorMessage: string) => {
      // Clean up pending card
      if (generatedCard) {
        await cleanupPendingCard(generatedCard.id);
      }

      setError(errorMessage);
      setState("error");
    },
    [generatedCard, cleanupPendingCard],
  );

  /**
   * Handle payment cancellation
   */
  const onPaymentCancelled = useCallback(async () => {
    console.log(`🚫 Payment cancelled`);

    // Clean up pending card
    if (generatedCard) {
      await cleanupPendingCard(generatedCard.id);
    }

    setState("idle");
  }, [generatedCard, cleanupPendingCard]);

  /**
   * Complete success flow
   */
  const onSuccessComplete = useCallback(() => {
    console.log(`✅ Success flow completed`);
    setState("idle");
    setGeneratedCard(null);
    setCompletedCard(null);
  }, []);

  /**
   * Reset entire flow
   */
  const reset = useCallback(async () => {
    console.log(`🔄 Resetting join flow`);

    // Clean up any pending card
    if (generatedCard) {
      await cleanupPendingCard(generatedCard.id);
    }

    setState("idle");
    setGeneratedCard(null);
    setCompletedCard(null);
    setError(null);
  }, [generatedCard, cleanupPendingCard]);

  // Computed state
  const canCancel = state === "ready-for-payment";
  const showPaymentModal =
    state === "ready-for-payment" || state === "payment-in-progress";
  const showSuccessModal = state === "success";

  return {
    // State
    state,
    generatedCard,
    completedCard,
    error,

    // Computed state
    canCancel,
    showPaymentModal,
    showSuccessModal,

    // Actions
    startJoinFlow,
    onPaymentStarted,
    onPaymentSuccess,
    onPaymentError,
    onPaymentCancelled,
    onSuccessComplete,
    reset,
  };
}

export default usePoolJoinFlow;
