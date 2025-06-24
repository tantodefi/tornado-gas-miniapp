import { useState, useEffect, useCallback } from "react";
import {
  loadCardsFromStorage,
  addCardToStorage,
  updateCardInStorage,
  removeCardFromStorage,
  generateNewCard,
  getCardStatsFromStorage,
  findCardInStorage,
  type IssuedCard,
} from "@/lib/storage/card-storage";
import { isCardExpired } from "@/lib/card-generation";

interface UseCardIssuanceResult {
  // State
  issuedCards: IssuedCard[];
  isIssuing: boolean;

  // Actions
  issueNewCard: () => Promise<IssuedCard>;
  activateCard: (
    cardId: string,
    network: IssuedCard["network"],
    amount: number,
  ) => void;
  deactivateCard: (cardId: string) => void;
  deleteCard: (cardId: string) => void;
  clearAllCards: () => void;

  // Getters
  getCardById: (cardId: string) => IssuedCard | undefined;
  getActiveCards: () => IssuedCard[];
  getInactiveCards: () => IssuedCard[];
  getCardStats: () => ReturnType<typeof getCardStatsFromStorage>;
  isCardExpired: (card: IssuedCard) => boolean;

  // Refresh
  refreshCards: () => void;
}

/**
 * Custom hook for card issuance management
 * Single responsibility: React state management for card operations
 * Uses storage utilities for persistence, focuses on business logic
 */
export function useCardIssuance(): UseCardIssuanceResult {
  const [issuedCards, setIssuedCards] = useState<IssuedCard[]>([]);
  const [isIssuing, setIsIssuing] = useState(false);

  // Load cards from storage on mount
  useEffect(() => {
    const cards = loadCardsFromStorage();
    setIssuedCards(cards);
  }, []);

  // Refresh cards from storage (useful after external changes)
  const refreshCards = useCallback(() => {
    const cards = loadCardsFromStorage();
    setIssuedCards(cards);
  }, []);

  // Issue a new card with realistic timing
  const issueNewCard = useCallback(async (): Promise<IssuedCard> => {
    setIsIssuing(true);

    try {
      // Simulate card generation delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate and save new card
      const newCard = generateNewCard();
      const updatedCards = addCardToStorage(newCard);

      // Update React state
      setIssuedCards(updatedCards);

      return newCard;
    } finally {
      setIsIssuing(false);
    }
  }, []);

  // Activate a card (called after successful top-up)
  const activateCard = useCallback(
    (cardId: string, network: IssuedCard["network"], amount: number) => {
      const updates: Partial<IssuedCard> = {
        status: "active" as const,
        network,
        amount,
      };

      const updatedCards = updateCardInStorage(cardId, updates);
      setIssuedCards(updatedCards);
    },
    [],
  );

  // Deactivate a card
  const deactivateCard = useCallback((cardId: string) => {
    const updates: Partial<IssuedCard> = {
      status: "inactive" as const,
      network: undefined,
      amount: undefined,
    };

    const updatedCards = updateCardInStorage(cardId, updates);
    setIssuedCards(updatedCards);
  }, []);

  // Delete a card permanently
  const deleteCard = useCallback((cardId: string) => {
    const updatedCards = removeCardFromStorage(cardId);
    setIssuedCards(updatedCards);
  }, []);

  // Clear all cards
  const clearAllCards = useCallback(() => {
    setIssuedCards([]);
    // Note: We're using the storage utility for consistency
    const updatedCards = removeCardFromStorage(""); // This will clear all
    setIssuedCards(updatedCards);
  }, []);

  // Get a specific card by ID (from current state for performance)
  const getCardById = useCallback(
    (cardId: string): IssuedCard | undefined => {
      return issuedCards.find((card) => card.id === cardId);
    },
    [issuedCards],
  );

  // Get all active cards
  const getActiveCards = useCallback((): IssuedCard[] => {
    return issuedCards.filter((card) => card.status === "active");
  }, [issuedCards]);

  // Get all inactive cards
  const getInactiveCards = useCallback((): IssuedCard[] => {
    return issuedCards.filter((card) => card.status === "inactive");
  }, [issuedCards]);

  // Get card statistics (delegates to storage utility)
  const getCardStats = useCallback(() => {
    return getCardStatsFromStorage();
  }, []);

  // Check if card is expired
  const checkCardExpired = useCallback((card: IssuedCard): boolean => {
    return isCardExpired(card.expiresAt);
  }, []);

  return {
    // State
    issuedCards,
    isIssuing,

    // Actions
    issueNewCard,
    activateCard,
    deactivateCard,
    deleteCard,
    clearAllCards,

    // Getters
    getCardById,
    getActiveCards,
    getInactiveCards,
    getCardStats,
    isCardExpired: checkCardExpired,

    // Refresh
    refreshCards,
  };
}

/**
 * Hook for managing card operations with optimistic updates
 * Useful when you need immediate UI feedback
 */
export function useOptimisticCards() {
  const cardHook = useCardIssuance();
  const [optimisticCards, setOptimisticCards] = useState<IssuedCard[]>([]);

  // Sync optimistic state with actual state
  useEffect(() => {
    setOptimisticCards(cardHook.issuedCards);
  }, [cardHook.issuedCards]);

  const optimisticIssueCard = useCallback(async () => {
    // Add optimistic card immediately
    const optimisticCard = generateNewCard();
    setOptimisticCards((prev) => [optimisticCard, ...prev]);

    try {
      // Issue real card
      const realCard = await cardHook.issueNewCard();
      return realCard;
    } catch (error) {
      // Remove optimistic card on error
      setOptimisticCards((prev) =>
        prev.filter((card) => card.id !== optimisticCard.id),
      );
      throw error;
    }
  }, [cardHook]);

  return {
    ...cardHook,
    issuedCards: optimisticCards,
    issueNewCard: optimisticIssueCard,
  };
}
