//file:prepaid-gas-website/apps/web/components/features/cards/my-cards-page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCardIssuance } from "@/hooks/cards/use-card-issuance";
import { PageHeader } from "../../layout/page-header";
import { PoolCard } from "@/types";
import CardsTable from "./cards-table";
import CardReceipt from "./card-receipt";

interface MyCardsPageProps {
  // No props needed
}

/**
 * My Cards Page - RENAMED from PendingCardsPage
 *
 * Shows all purchased cards in a table format
 * Click any card to view receipt details
 */
const MyCardsPage: React.FC<MyCardsPageProps> = () => {
  const router = useRouter();

  // Use existing card issuance hook for all cards
  const { allCards, isLoading, getCardStats } = useCardIssuance();

  // Modal state for card receipt
  const [selectedCard, setSelectedCard] = useState<PoolCard | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Card statistics - UPDATED for new structure
  const [cardStats, setCardStats] = useState({
    total: 0,
    totalValue: 0,
  });

  // Load card stats on mount and when cards change
  useEffect(() => {
    loadCardStats();
  }, [allCards]);

  const loadCardStats = async () => {
    try {
      const stats = await getCardStats();
      setCardStats(stats);
    } catch (error) {
      console.error("Failed to load card stats:", error);
    }
  };

  // Handle card click - open receipt modal
  const handleCardClick = (card: PoolCard) => {
    setSelectedCard(card);
    setShowReceipt(true);
  };

  // Close receipt modal
  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setSelectedCard(null);
  };

  // Navigation handlers
  const handleBack = () => {
    router.push("/pools");
  };

  const handleCreateNewCard = () => {
    router.push("/pools");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PageHeader backText="← Back to Pools" onBack={handleBack} />

          <div className="text-center py-16">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-lg text-white animate-pulse">
              Loading your cards...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <PageHeader backText="← Back to Pools" onBack={handleBack} />

        {/* Page Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="heading-prepaid-section mb-4">
            <span className="text-prepaid-gradient-white">My </span>
            <span className="text-prepaid-gradient-brand">Gas Cards</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            View and manage your purchased gas cards. Click any card to view
            receipt details.
          </p>
        </motion.div>

        {/* Card Statistics - UPDATED: Simplified */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="stat-prepaid">
            <div className="stat-prepaid-number">{cardStats.total}</div>
            <div className="stat-prepaid-label">Total Cards</div>
          </div>
          <div className="stat-prepaid">
            <div className="stat-prepaid-number">
              {cardStats.totalValue.toFixed(3)}
            </div>
            <div className="stat-prepaid-label">ETH Value</div>
          </div>
        </motion.div>

        {/* Cards Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <CardsTable
            cards={allCards}
            isLoading={isLoading}
            onCardClick={handleCardClick}
          />
        </motion.div>

        {/* Create New Card Button */}
        {allCards.length > 0 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <button
              onClick={handleCreateNewCard}
              className="btn-prepaid-outline btn-lg"
            >
              + Purchase Another Card
            </button>
          </motion.div>
        )}
      </div>

      {/* Card Receipt Modal */}
      {showReceipt && selectedCard && (
        <CardReceipt
          card={selectedCard}
          showRecoveryPhrase={false}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
};

export default MyCardsPage;
