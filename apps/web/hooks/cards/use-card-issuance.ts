//file:prepaid-gas-website/apps/web/hooks/cards/use-card-issuance.ts
import { useState, useEffect, useCallback } from "react";
import {
  loadCardsFromIndexedDB,
  getCardStatsFromIndexedDB,
} from "@/lib/storage/indexed-db";
import type { PoolCard, CardStats } from "@/types";
interface UseCardIssuanceResult {
  allCards: PoolCard[];
  isLoading: boolean;

  getCardStats: () => Promise<CardStats>;

  refreshCards: () => Promise<void>;
}
/**
 * Updated hook for card management using IndexedDB
 * Handles both pending and active cards
 */
export function useCardIssuance(): UseCardIssuanceResult {
  const [allCards, setAllCards] = useState<PoolCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    isLoading,

    getCardStats,
    refreshCards,
  };
}
