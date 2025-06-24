import {
  generateCardId,
  generateAccountNumber,
  formatAccountNumber,
  generateExpirationDate,
  isCardExpired,
} from "@/lib/card-generation";

// Types
interface IssuedCard {
  id: string;
  accountNumber: string;
  issuedAt: string;
  status: "inactive" | "active";
  network?: {
    name: string;
    icon: string;
    color: string;
  };
  amount?: number;
  expiresAt: string;
}

// Storage key for localStorage
const STORAGE_KEY = "prepaid-gas-issued-cards";

/**
 * Pure utility functions for card storage
 * Single responsibility: handle localStorage operations
 * No React dependencies, easily testable
 */

/**
 * Load cards from localStorage
 * @returns Array of issued cards or empty array if none exist
 */
export function loadCardsFromStorage(): IssuedCard[] {
  try {
    if (typeof window === "undefined") {
      return []; // SSR safety
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const cards = JSON.parse(stored) as IssuedCard[];

    // Validate the structure
    if (!Array.isArray(cards)) {
      console.warn("Invalid cards data in localStorage, clearing...");
      clearCardsFromStorage();
      return [];
    }

    return cards;
  } catch (error) {
    console.error("Failed to load cards from localStorage:", error);
    return [];
  }
}

/**
 * Save cards to localStorage
 * @param cards - Array of cards to save
 */
export function saveCardsToStorage(cards: IssuedCard[]): void {
  try {
    if (typeof window === "undefined") {
      return; // SSR safety
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error("Failed to save cards to localStorage:", error);
  }
}

/**
 * Clear all cards from localStorage
 */
export function clearCardsFromStorage(): void {
  try {
    if (typeof window === "undefined") {
      return; // SSR safety
    }

    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear cards from localStorage:", error);
  }
}

/**
 * Generate a new card with unique ID and account number
 * @returns Newly generated card object
 */
export function generateNewCard(): IssuedCard {
  const now = new Date();

  return {
    id: generateCardId(),
    accountNumber: formatAccountNumber(generateAccountNumber()),
    issuedAt: now.toISOString(),
    status: "inactive",
    expiresAt: generateExpirationDate(),
  };
}

/**
 * Add a new card to storage
 * @param newCard - Card to add
 * @returns Updated array of all cards
 */
export function addCardToStorage(newCard: IssuedCard): IssuedCard[] {
  const existingCards = loadCardsFromStorage();
  const updatedCards = [newCard, ...existingCards];
  saveCardsToStorage(updatedCards);
  return updatedCards;
}

/**
 * Update a specific card in storage
 * @param cardId - ID of card to update
 * @param updates - Partial card updates
 * @returns Updated array of all cards
 */
export function updateCardInStorage(
  cardId: string,
  updates: Partial<IssuedCard>,
): IssuedCard[] {
  const existingCards = loadCardsFromStorage();
  const updatedCards = existingCards.map((card) =>
    card.id === cardId ? { ...card, ...updates } : card,
  );
  saveCardsToStorage(updatedCards);
  return updatedCards;
}

/**
 * Remove a card from storage
 * @param cardId - ID of card to remove
 * @returns Updated array of remaining cards
 */
export function removeCardFromStorage(cardId: string): IssuedCard[] {
  const existingCards = loadCardsFromStorage();
  const updatedCards = existingCards.filter((card) => card.id !== cardId);
  saveCardsToStorage(updatedCards);
  return updatedCards;
}

/**
 * Get card statistics from storage
 * @returns Statistics object
 */
export function getCardStatsFromStorage() {
  const cards = loadCardsFromStorage();

  const total = cards.length;
  const active = cards.filter((card) => card.status === "active").length;
  const inactive = cards.filter((card) => card.status === "inactive").length;
  const expired = cards.filter((card) => isCardExpired(card.expiresAt)).length;
  const totalValue = cards
    .filter((card) => card.status === "active" && card.amount)
    .reduce((sum, card) => sum + (card.amount || 0), 0);

  return {
    total,
    active,
    inactive,
    expired,
    totalValue,
  };
}

/**
 * Find a card by ID in storage
 * @param cardId - ID to search for
 * @returns Card if found, undefined otherwise
 */
export function findCardInStorage(cardId: string): IssuedCard | undefined {
  const cards = loadCardsFromStorage();
  return cards.find((card) => card.id === cardId);
}

// Export types for use in other modules
export type { IssuedCard };
