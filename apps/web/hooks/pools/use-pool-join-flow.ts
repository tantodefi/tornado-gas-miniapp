//file: hooks/pools/use-pool-join-flow.ts
import { useState, useCallback } from "react";
import { Pool, PoolCard, PaymentDetails, PaymentPool } from "@/types";
import {
  generateCompleteIdentity,
  IdentitySecurity,
} from "@/lib/identity/generator";
import {
  saveCardToIndexedDB,
  updateCardInIndexedDB,
  deleteCardFromIndexedDB,
} from "@/lib/storage/indexed-db";
import { encodePaymasterContext } from "@workspace/core";

/**
 * Simple state machine for pool joining flow
 */
type JoinFlowState =
  | "idle" // Ready to join
  | "joining" // Generating identity and card
  | "payment" // Payment modal open
  | "paying" // Payment in progress (disable cancel)
  | "success" // Success screen showing
  | "completed" // Flow completed
  | "cancelled" // Flow cancelled
  | "error"; // Error occurred

/**
 * Return type for usePoolJoinFlow hook
 */
interface UsePoolJoinFlowResult {
  // State
  state: JoinFlowState;
  generatedCard: PoolCard | null;
  activatedCard: PoolCard | null;
  error: string | null;
  paymentPool: PaymentPool | null;

  // Computed state for UI
  isJoining: boolean;
  showPayment: boolean;
  showSuccess: boolean;
  canCancel: boolean; // NEW: Disable cancel during payment

  // Actions
  startJoin: () => Promise<void>;
  setPaymentInProgress: () => void;
  handlePaymentSuccess: (details: PaymentDetails) => Promise<void>;
  handlePaymentError: (error: string) => Promise<void>;
  handlePaymentCancel: () => Promise<void>;
  handleSuccessComplete: () => void;
  reset: () => void;
}

/**
 * Simplified hook for managing the entire pool joining flow
 *
 * Single Responsibility: Manage the complete join flow with a simple state machine
 *
 * State Flow:
 * idle → joining → payment → paying → success → completed
 *   ↓      ↓         ↓        ↓
 * error  error    cancelled  error
 *
 * @param pool - Pool to join
 * @returns Simplified state and actions
 */
export function usePoolJoinFlow(pool: Pool | null): UsePoolJoinFlowResult {
  // Single state machine instead of multiple boolean states
  const [state, setState] = useState<JoinFlowState>("idle");
  const [generatedCard, setGeneratedCard] = useState<PoolCard | null>(null);
  const [activatedCard, setActivatedCard] = useState<PoolCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔧 ENHANCED: Comprehensive card cleanup function
   */
  const cleanupGeneratedCard = useCallback(
    async (reason: string): Promise<boolean> => {
      if (!generatedCard) {
        console.log("🔍 No generated card to cleanup");
        return true;
      }

      try {
        console.log(
          `🗑️ Cleaning up generated card (${reason}):`,
          generatedCard.id,
        );
        await deleteCardFromIndexedDB(generatedCard.id);
        setGeneratedCard(null);
        console.log("✅ Card cleanup successful");
        return true;
      } catch (cleanupError) {
        console.error("❌ Failed to cleanup generated card:", cleanupError);
        // Don't let cleanup errors break the flow
        return false;
      }
    },
    [generatedCard],
  );

  /**
   * Start the join process - generate identity and card
   */
  const startJoin = useCallback(async () => {
    if (!pool || state === "joining") return;

    try {
      setState("joining");
      setError(null);
      setGeneratedCard(null); // 🔧 ADDED: Clear any existing card

      console.log("🔐 Starting pool join process for pool:", pool.poolId);

      // Validate secure environment
      IdentitySecurity.validateSecureContext();

      // Generate complete identity
      const identity = generateCompleteIdentity();

      // Generate paymaster context
      const paymasterContext = encodePaymasterContext(
        pool.paymaster.address as `0x${string}`,
        pool.poolId,
        identity.identity.export(),
      );

      // Create complete card
      const newCard: PoolCard = {
        id: identity.cardId,
        poolInfo: {
          poolId: pool.poolId,
          joiningFee: pool.joiningFee,
          network: pool.network,
          paymasterType: pool.paymaster.contractType,
        },
        identity: {
          mnemonic: identity.mnemonic,
          privateKey: identity.privateKey,
          commitment: identity.commitment,
        },
        paymasterContract: pool.paymaster.address,
        paymasterContext,
        transactionHash: "", // Will be updated after payment
        chainId: pool.chainId,
        purchasedAt: new Date().toISOString(),
        expiresAt: identity.expiresAt,
        status: "active" as const,
        balance: "0",
      };

      // Save to IndexedDB
      await saveCardToIndexedDB(newCard);
      setGeneratedCard(newCard);

      // Automatically proceed to payment
      setState("payment");

      console.log("✅ Join preparation completed, opening payment modal");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("❌ Pool join failed:", error);

      // 🔧 ENHANCED: Cleanup any partial card creation
      await cleanupGeneratedCard("join_error");

      setError(`Failed to join pool: ${errorMessage}`);
      setState("error");
    }
  }, [pool, state, cleanupGeneratedCard]);

  /**
   * Mark payment as in progress (disables cancel button)
   * Called when wallet confirmation dialog appears
   */
  const setPaymentInProgress = useCallback(() => {
    console.log("💳 Payment in progress - disabling cancel button");
    if (state === "payment") {
      setState("paying");
    }
  }, [state]);

  /**
   * Handle payment cancellation with card cleanup
   */
  const handlePaymentCancel = useCallback(async () => {
    console.log("🚫 Payment cancelled by user");

    // Clean up generated card from IndexedDB since payment was cancelled
    await cleanupGeneratedCard("user_cancellation");

    setState("cancelled");
  }, [cleanupGeneratedCard]);

  /**
   * Handle successful payment
   */
  const handlePaymentSuccess = useCallback(
    async (details: PaymentDetails) => {
      if (!generatedCard) {
        console.error("❌ No generated card for payment success");
        setError(
          "Payment succeeded but card is missing. Please contact support.",
        );
        setState("error");
        return;
      }

      console.log("✅ Payment successful:", details.transactionHash);

      try {
        // Update card with payment details
        const updates = {
          transactionHash: details.transactionHash,
          chainId: details.network.chainId,
          blockNumber: details.blockNumber,
          gasUsed: details.gasUsed,
          balance: (parseFloat(details.pool.joiningFee) / 1e18).toString(),
        };

        // Update in IndexedDB
        const updatedCard = await updateCardInIndexedDB(
          generatedCard.id,
          updates,
        );

        // Create final card for UI (use updated card from DB if available)
        const finalCard: PoolCard = updatedCard || {
          ...generatedCard,
          ...updates,
        };

        setActivatedCard(finalCard);
        setState("success");

        console.log("🎉 Payment completed successfully");
      } catch (error) {
        console.error("❌ Failed to update card:", error);

        // Still show success with fallback card
        const fallbackCard: PoolCard = {
          ...generatedCard,
          transactionHash: details.transactionHash,
          chainId: details.network.chainId,
          blockNumber: details.blockNumber,
          gasUsed: details.gasUsed,
          balance: (parseFloat(details.pool.joiningFee) / 1e18).toString(),
        };

        setActivatedCard(fallbackCard);
        setState("success");
      }
    },
    [generatedCard],
  );

  /**
   * 🔧 ENHANCED: Handle payment error with proper cleanup
   */
  const handlePaymentError = useCallback(
    async (errorMessage: string) => {
      console.log("❌ Payment error received:", errorMessage);

      // Check if it's a user rejection (treat as cancellation, not error)
      const isUserRejection =
        errorMessage.toLowerCase().includes("user rejected") ||
        errorMessage.toLowerCase().includes("user denied") ||
        errorMessage.toLowerCase().includes("rejected the request") ||
        errorMessage.toLowerCase().includes("user cancelled") ||
        errorMessage.toLowerCase().includes("cancelled by user") ||
        errorMessage.toLowerCase().includes("rejected by user");

      if (isUserRejection) {
        console.log("🚫 User rejected transaction - treating as cancellation");
        await handlePaymentCancel();
        return;
      }

      // Real payment error - clean up generated card
      await cleanupGeneratedCard("payment_error");

      setError(`Payment failed: ${errorMessage}`);
      setState("error");
    },
    [cleanupGeneratedCard, handlePaymentCancel],
  );

  /**
   * Handle success screen completion
   */
  const handleSuccessComplete = useCallback(() => {
    console.log("✅ Success screen completed");
    setState("completed");
  }, []);

  /**
   * 🔧 ENHANCED: Reset entire flow with comprehensive cleanup
   */
  const reset = useCallback(async () => {
    console.log("🔄 Resetting join flow");

    // Clean up any existing cards
    await cleanupGeneratedCard("flow_reset");

    setState("idle");
    setGeneratedCard(null);
    setActivatedCard(null);
    setError(null);

    console.log("✅ Flow reset completed");
  }, [cleanupGeneratedCard]);

  // Computed state for UI
  const isJoining = state === "joining";
  const showPayment = state === "payment" || state === "paying";
  const showSuccess = state === "success";
  const canCancel = state === "payment"; // Can only cancel before payment starts
  const paymentPool: PaymentPool | null = pool;

  return {
    // State
    state,
    generatedCard,
    activatedCard,
    error,
    paymentPool,

    // Computed state for UI
    isJoining,
    showPayment,
    showSuccess,
    canCancel,

    // Actions
    startJoin,
    setPaymentInProgress,
    handlePaymentSuccess,
    handlePaymentError,
    handlePaymentCancel,
    handleSuccessComplete,
    reset,
  };
}
