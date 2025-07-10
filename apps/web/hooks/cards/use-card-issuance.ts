//file:prepaid-gas-website/apps/web/hooks/cards/use-card-issuance.ts

import { useState, useEffect, useCallback } from "react";
import {
  loadCompletedCards,
  getCardStats,
  PoolCard,
} from "@/lib/storage/indexed-db";

type CardStats = {
  total: number;
  completed: number;
};

interface UseCardIssuanceResult {
  completedCards: PoolCard[];
  isLoading: boolean;
  error: string | null;
  stats: CardStats;
  refreshCards: () => Promise<void>;
}

/**
 * Hook for managing completed cards
 * Single responsibility: Load and manage completed cards for My Cards page
 */
function useCardIssuance(): UseCardIssuanceResult {
  const [completedCards, setCompletedCards] = useState<PoolCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CardStats>({ total: 0, completed: 0 });

  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load only completed cards
      const cards = await loadCompletedCards();
      const cardStats = await getCardStats();

      setCompletedCards(cards);
      setStats(cardStats);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load cards";
      console.error("Failed to load cards:", error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load cards on mount
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  return {
    completedCards,
    isLoading,
    error,
    stats,
    refreshCards: loadCards,
  };
}

export { useCardIssuance };
