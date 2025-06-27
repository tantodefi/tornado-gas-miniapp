// apps/web/hooks/payment/use-payment.ts

"use client";

import { useState, useCallback } from "react";
import { useCardIssuance } from "../cards/use-card-issuance";
import type {
  PaymentPool,
  PaymentData,
  PaymentDetails,
  PaymentError,
  PaymentCallbacks,
  PaymentState,
  PoolCard,
} from "@/types";

/**
 * Payment hook result interface
 */
interface UsePaymentResult {
  // Payment state
  paymentState: PaymentState;
  isProcessing: boolean;
  error: string | null;

  // Payment data (if successful)
  paymentDetails: PaymentDetails | null;
  activatedCard: PoolCard | null;

  // Actions
  startPayment: () => void;
  resetPayment: () => void;

  // Callbacks for PaymentManager
  paymentCallbacks: PaymentCallbacks;
}

/**
 * Payment hook configuration
 */
interface UsePaymentConfig {
  /** Pool to join */
  pool: PaymentPool;
  /** Existing pending card to activate */
  card: PoolCard;
  /** Success callback after card activation */
  onSuccess?: (activatedCard: PoolCard, paymentDetails: PaymentDetails) => void;
  /** Error callback */
  onError?: (error: string) => void;
}

/**
 * Main payment hook for handling pool joining payments
 * Integrates with existing card system and provides clean state management
 */
export function usePayment({
  pool,
  card,
  onSuccess,
  onError,
}: UsePaymentConfig): UsePaymentResult {
  // Payment state
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );
  const [activatedCard, setActivatedCard] = useState<PoolCard | null>(null);

  // Card management hook
  const { activateCard } = useCardIssuance();

  // Derived state
  const isProcessing =
    paymentState !== "idle" &&
    paymentState !== "success" &&
    paymentState !== "error";

  // Start payment process
  const startPayment = useCallback(() => {
    setPaymentState("connecting");
    setError(null);
    setPaymentDetails(null);
    setActivatedCard(null);
  }, []);

  // Reset payment state
  const resetPayment = useCallback(() => {
    setPaymentState("idle");
    setError(null);
    setPaymentDetails(null);
    setActivatedCard(null);
  }, []);

  // Handle payment started - update state
  const handlePaymentStarted = useCallback((paymentData: PaymentData) => {
    console.log("Payment started for card:", paymentData.cardId);
    setPaymentState("pending");
    setError(null);
  }, []);

  // Handle payment completed - activate card
  const handlePaymentCompleted = useCallback(
    async (details: PaymentDetails) => {
      console.log("Payment completed, activating card:", details.card.id);

      try {
        setPaymentState("activating");
        setPaymentDetails(details);

        // Activate the card in storage
        // Calculate balance from joining fee (could be more sophisticated)
        const balance = formatEthAmount(details.pool.joiningFee);

        await activateCard(details.card.id, balance);

        // Get the activated card (with updated status)
        const updatedCard: PoolCard = {
          ...details.card,
          status: "active",
          balance,
          joinedAt: new Date().toISOString(),
        };

        setActivatedCard(updatedCard);
        setPaymentState("success");

        // Call success callback
        onSuccess?.(updatedCard, details);

        console.log("Card activated successfully:", updatedCard.id);
      } catch (error) {
        console.error("Failed to activate card:", error);
        const errorMessage =
          error instanceof Error
            ? `Failed to activate card: ${error.message}`
            : "Failed to activate card after payment";

        setError(errorMessage);
        setPaymentState("error");
        onError?.(errorMessage);
      }
    },
    [activateCard, onSuccess, onError],
  );

  // Handle payment error
  const handlePaymentError = useCallback(
    (paymentError: PaymentError) => {
      console.error("Payment error:", paymentError);

      setError(paymentError.message);
      setPaymentState("error");
      onError?.(paymentError.message);
    },
    [onError],
  );

  // Payment callbacks for PaymentManager
  const paymentCallbacks: PaymentCallbacks = {
    onPaymentStarted: handlePaymentStarted,
    onPaymentCompleted: handlePaymentCompleted,
    onPaymentError: handlePaymentError,
  };

  return {
    // State
    paymentState,
    isProcessing,
    error,
    paymentDetails,
    activatedCard,

    // Actions
    startPayment,
    resetPayment,

    // Callbacks
    paymentCallbacks,
  };
}

/**
 * Helper function to format ETH amount for balance
 */
function formatEthAmount(weiString: string): string {
  try {
    const wei = BigInt(weiString);
    const eth = Number(wei) / 1e18;
    return eth.toFixed(6);
  } catch {
    return "0.000000";
  }
}

/**
 * Helper hook for payment state display
 */
export function usePaymentStateText(paymentState: PaymentState): {
  title: string;
  description: string;
  isLoading: boolean;
} {
  switch (paymentState) {
    case "idle":
      return {
        title: "Ready to Pay",
        description: "Choose your payment method to join the pool",
        isLoading: false,
      };

    case "connecting":
      return {
        title: "Connecting...",
        description: "Connecting to payment provider",
        isLoading: true,
      };

    case "pending":
      return {
        title: "Payment in Progress",
        description: "Please complete the payment in your wallet",
        isLoading: true,
      };

    case "confirming":
      return {
        title: "Confirming Transaction",
        description: "Waiting for blockchain confirmation",
        isLoading: true,
      };

    case "activating":
      return {
        title: "Activating Card",
        description: "Your payment was successful! Activating your gas card...",
        isLoading: true,
      };

    case "success":
      return {
        title: "Payment Successful!",
        description: "Your gas card is now active and ready to use",
        isLoading: false,
      };

    case "error":
      return {
        title: "Payment Failed",
        description: "Something went wrong with your payment",
        isLoading: false,
      };

    default:
      return {
        title: "Unknown State",
        description: "Please try again",
        isLoading: false,
      };
  }
}
