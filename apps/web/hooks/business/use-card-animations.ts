import { useState, useCallback } from "react";

// Animation flow states
type AnimationFlowState = "initial" | "issuing" | "success";

interface UseCardAnimationsResult {
  // Flow state
  flowState: AnimationFlowState;
  isInInitialState: boolean;
  isIssuing: boolean;
  isSuccess: boolean;

  // Animation state
  showPrintingAnimation: boolean;

  // Flow control
  startIssuanceFlow: () => void;
  completeAnimation: () => void;
  resetToInitial: () => void;

  // Animation control
  startPrintingAnimation: () => void;
  stopPrintingAnimation: () => void;
}

/**
 * Hook for managing card issuance animation states and flow
 * Single responsibility: handle animation timing and flow transitions
 * No business logic, no storage operations
 */
export function useCardAnimations(): UseCardAnimationsResult {
  const [flowState, setFlowState] = useState<AnimationFlowState>("initial");
  const [showPrintingAnimation, setShowPrintingAnimation] = useState(false);

  // Computed states for easier consumption
  const isInInitialState = flowState === "initial";
  const isIssuing = flowState === "issuing";
  const isSuccess = flowState === "success";

  // Flow control functions
  const startIssuanceFlow = useCallback(() => {
    setFlowState("issuing");
    setShowPrintingAnimation(true);
  }, []);

  const completeAnimation = useCallback(() => {
    setShowPrintingAnimation(false);
    setFlowState("success");
  }, []);

  const resetToInitial = useCallback(() => {
    setFlowState("initial");
    setShowPrintingAnimation(false);
  }, []);

  // Animation control functions
  const startPrintingAnimation = useCallback(() => {
    setShowPrintingAnimation(true);
  }, []);

  const stopPrintingAnimation = useCallback(() => {
    setShowPrintingAnimation(false);
  }, []);

  return {
    // Flow state
    flowState,
    isInInitialState,
    isIssuing,
    isSuccess,

    // Animation state
    showPrintingAnimation,

    // Flow control
    startIssuanceFlow,
    completeAnimation,
    resetToInitial,

    // Animation control
    startPrintingAnimation,
    stopPrintingAnimation,
  };
}

/**
 * Hook for managing complex multi-step animations
 * Useful for sequences that need precise timing control
 */
export function useAnimationSequence() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const startSequence = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const completeSequence = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  const resetSequence = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  return {
    currentStep,
    isPlaying,
    startSequence,
    nextStep,
    completeSequence,
    resetSequence,
  };
}

/**
 * Hook for managing loading states with animation
 * Useful for operations that need visual feedback
 */
export function useLoadingAnimation(minimumDuration: number = 500) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setShowAnimation(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);

    // Keep animation visible for minimum duration for better UX
    setTimeout(() => {
      setShowAnimation(false);
    }, minimumDuration);
  }, [minimumDuration]);

  const forceStopAnimation = useCallback(() => {
    setIsLoading(false);
    setShowAnimation(false);
  }, []);

  return {
    isLoading,
    showAnimation,
    startLoading,
    stopLoading,
    forceStopAnimation,
  };
}
