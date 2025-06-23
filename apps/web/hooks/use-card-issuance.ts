// hooks/use-card-issuance.ts
import { useState, useCallback, useEffect } from "react";
import { generateCardId, generateAccountNumber, formatAccountNumber, generateExpirationDate, isCardExpired } from "@/lib/card-generation";

// Types for issued cards
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

// Local storage key for persisting issued cards
const STORAGE_KEY = "prepaid-gas-issued-cards";

// Custom hook for card issuance management
export const useCardIssuance = () => {
    const [issuedCards, setIssuedCards] = useState<IssuedCard[]>([]);
    const [isIssuing, setIsIssuing] = useState(false);

    // Load issued cards from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const cards = JSON.parse(stored) as IssuedCard[];
                setIssuedCards(cards);
            }
        } catch (error) {
            console.error("Failed to load issued cards from localStorage:", error);
        }
    }, []);

    // Save cards to localStorage whenever cards state changes
    const saveCardsToStorage = useCallback((cards: IssuedCard[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
        } catch (error) {
            console.error("Failed to save cards to localStorage:", error);
        }
    }, []);

    // Issue a new card
    const issueNewCard = useCallback(async (): Promise<IssuedCard> => {
        setIsIssuing(true);

        try {
            // Simulate card generation delay (for realistic UX)
            await new Promise((resolve) => setTimeout(resolve, 500));

            const now = new Date();
            const newCard: IssuedCard = {
                id: generateCardId(),
                accountNumber: formatAccountNumber(generateAccountNumber()),
                issuedAt: now.toISOString(),
                status: "inactive",
                expiresAt: generateExpirationDate(),
            };

            setIssuedCards((prevCards) => {
                const updatedCards = [newCard, ...prevCards];
                saveCardsToStorage(updatedCards);
                return updatedCards;
            });

            return newCard;
        } finally {
            setIsIssuing(false);
        }
    }, [saveCardsToStorage]);

    // Activate a card (called after successful top-up)
    const activateCard = useCallback(
        (cardId: string, network: IssuedCard["network"], amount: number) => {
            setIssuedCards((prevCards) => {
                const updatedCards = prevCards.map((card) => (card.id === cardId ? { ...card, status: "active" as const, network, amount } : card));
                saveCardsToStorage(updatedCards);
                return updatedCards;
            });
        },
        [saveCardsToStorage]
    );

    // Deactivate a card (if needed)
    const deactivateCard = useCallback(
        (cardId: string) => {
            setIssuedCards((prevCards) => {
                const updatedCards = prevCards.map((card) =>
                    card.id === cardId ? { ...card, status: "inactive" as const, network: undefined, amount: undefined } : card
                );
                saveCardsToStorage(updatedCards);
                return updatedCards;
            });
        },
        [saveCardsToStorage]
    );

    // Get a specific card by ID
    const getCardById = useCallback(
        (cardId: string): IssuedCard | undefined => {
            return issuedCards.find((card) => card.id === cardId);
        },
        [issuedCards]
    );

    // Get all active cards
    const getActiveCards = useCallback((): IssuedCard[] => {
        return issuedCards.filter((card) => card.status === "active");
    }, [issuedCards]);

    // Get all inactive cards
    const getInactiveCards = useCallback((): IssuedCard[] => {
        return issuedCards.filter((card) => card.status === "inactive");
    }, [issuedCards]);

    // Delete a card (permanent removal)
    const deleteCard = useCallback(
        (cardId: string) => {
            setIssuedCards((prevCards) => {
                const updatedCards = prevCards.filter((card) => card.id !== cardId);
                saveCardsToStorage(updatedCards);
                return updatedCards;
            });
        },
        [saveCardsToStorage]
    );

    // Clear all cards (for testing/reset)
    const clearAllCards = useCallback(() => {
        setIssuedCards([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Failed to clear cards from localStorage:", error);
        }
    }, []);

    // Check if card is expired using utility function
    const checkCardExpired = useCallback((card: IssuedCard): boolean => {
        return isCardExpired(card.expiresAt);
    }, []);

    // Get card statistics
    const getCardStats = useCallback(() => {
        const total = issuedCards.length;
        const active = issuedCards.filter((card) => card.status === "active").length;
        const inactive = issuedCards.filter((card) => card.status === "inactive").length;
        const expired = issuedCards.filter((card) => checkCardExpired(card)).length;
        const totalValue = issuedCards.filter((card) => card.status === "active" && card.amount).reduce((sum, card) => sum + (card.amount || 0), 0);

        return {
            total,
            active,
            inactive,
            expired,
            totalValue,
        };
    }, [issuedCards, checkCardExpired]);

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
    };
};

// Export types for use in components
export type { IssuedCard };
