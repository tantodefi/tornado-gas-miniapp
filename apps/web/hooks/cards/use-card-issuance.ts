// hooks/cards/use-card-issuance.ts
import { useState, useEffect, useCallback } from "react";
import {
  loadCardsFromIndexedDB,
  saveCardToIndexedDB,
  updateCardInIndexedDB,
  deleteCardFromIndexedDB,
  getCardsByStatus,
  getCardStatsFromIndexedDB,
  findCardInIndexedDB,
} from "@/lib/storage/indexed-db";
import type { PoolCard, CardStats } from "@/types";

interface UseCardIssuanceResult {
  // State
  allCards: PoolCard[];
  pendingCards: PoolCard[];
  activeCards: PoolCard[];
  isLoading: boolean;

  // Actions
  createCard: (card: PoolCard) => Promise<void>;
  activateCard: (cardId: string, balance: string) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  clearAllCards: () => Promise<void>;

  // Getters
  getCardById: (cardId: string) => Promise<PoolCard | null>;
  getCardStats: () => Promise<CardStats>;

  // Refresh
  refreshCards: () => Promise<void>;
}
/**
 * Updated hook for card management using IndexedDB
 * Handles both pending and active cards
 */
export function useCardIssuance(): UseCardIssuanceResult {
  const [allCards, setAllCards] = useState<PoolCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state
  const pendingCards = allCards.filter(
    (card) => card.status === "pending-topup",
  );
  const activeCards = allCards.filter((card) => card.status === "active");

  // Load cards from IndexedDB on mount
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const cards = await loadCardsFromIndexedDB();
      setAllCards(cards);
    } catch (error) {
      console.error("Failed to load cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new card (used by identity generation flow)
  const createCard = useCallback(
    async (card: PoolCard) => {
      try {
        await saveCardToIndexedDB(card);
        await loadCards(); // Refresh state
      } catch (error) {
        console.error("Failed to create card:", error);
        throw error;
      }
    },
    [loadCards],
  );

  // Activate a card (called after successful top-up/pool join)
  const activateCard = useCallback(
    async (cardId: string, balance: string) => {
      try {
        const updates: Partial<PoolCard> = {
          status: "active",
          balance,
          joinedAt: new Date().toISOString(),
        };

        await updateCardInIndexedDB(cardId, updates);
        await loadCards(); // Refresh state
      } catch (error) {
        console.error("Failed to activate card:", error);
        throw error;
      }
    },
    [loadCards],
  );

  // Delete a card permanently
  const deleteCard = useCallback(
    async (cardId: string) => {
      try {
        await deleteCardFromIndexedDB(cardId);
        await loadCards(); // Refresh state
      } catch (error) {
        console.error("Failed to delete card:", error);
        throw error;
      }
    },
    [loadCards],
  );

  // Clear all cards
  const clearAllCards = useCallback(async () => {
    try {
      // Delete each card individually to ensure clean state
      await Promise.all(
        allCards.map((card) => deleteCardFromIndexedDB(card.id)),
      );
      await loadCards(); // Refresh state
    } catch (error) {
      console.error("Failed to clear all cards:", error);
      throw error;
    }
  }, [allCards, loadCards]);

  // Get a specific card by ID
  const getCardById = useCallback(
    async (cardId: string): Promise<PoolCard | null> => {
      try {
        return await findCardInIndexedDB(cardId);
      } catch (error) {
        console.error("Failed to get card by ID:", error);
        return null;
      }
    },
    [],
  );

  // Get card statistics - ✅ Fixed implementation
  const getCardStats = useCallback(async () => {
    try {
      return await getCardStatsFromIndexedDB();
    } catch (error) {
      console.error("Failed to get card stats:", error);
      return {
        total: 0,
        active: 0,
        pending: 0,
        totalValue: 0,
      };
    }
  }, []);

  // Refresh cards (for manual refresh)
  const refreshCards = useCallback(async () => {
    await loadCards();
  }, [loadCards]);

  return {
    // State
    allCards,
    pendingCards,
    activeCards,
    isLoading,

    // Actions
    createCard,
    activateCard,
    deleteCard,
    clearAllCards,

    // Getters
    getCardById,
    getCardStats,

    // Refresh
    refreshCards,
  };
}

/**
 * Hook specifically for pending cards
 */
export function usePendingCards() {
  const [pendingCards, setPendingCards] = useState<PoolCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPendingCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const cards = await getCardsByStatus("pending-topup");
      setPendingCards(cards);
    } catch (error) {
      console.error("Failed to load pending cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingCards();
  }, [loadPendingCards]);

  return {
    pendingCards,
    isLoading,
    refreshPendingCards: loadPendingCards,
  };
}

/**
 * Hook specifically for active cards
 */
export function useActiveCards() {
  const [activeCards, setActiveCards] = useState<PoolCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadActiveCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const cards = await getCardsByStatus("active");
      setActiveCards(cards);
    } catch (error) {
      console.error("Failed to load active cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActiveCards();
  }, [loadActiveCards]);

  return {
    activeCards,
    isLoading,
    refreshActiveCards: loadActiveCards,
  };
}

// Export types for use in components
export type { PoolCard };
