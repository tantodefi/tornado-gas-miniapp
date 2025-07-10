//file:prepaid-gas-website/apps/web/components/features/cards/my-cards-page.tsx

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCardIssuance } from "@/hooks/cards/use-card-issuance";
import { AppHeader } from "@/components/layout/app-header";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import CardsTable from "./cards-table";
import CardReceipt from "./card-receipt";
import { PoolCard } from "@/lib/storage/indexed-db";

/**
 * My Cards Page Component with simplified header and breadcrumb
 */
function MyCardsPage() {
  const router = useRouter();

  // Load completed cards only
  const { completedCards, isLoading, error, stats, refreshCards } =
    useCardIssuance();

  // Modal state for card receipt
  const [selectedCard, setSelectedCard] = useState<PoolCard | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

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
  const handleCreateNewCard = () => {
    router.push("/pools");
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "My Cards", isCurrentPage: true },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
        <AppHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageBreadcrumb items={breadcrumbItems} className="mb-8" />

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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
        <AppHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageBreadcrumb items={breadcrumbItems} className="mb-8" />

          <div className="text-center py-16">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Error Loading Cards
            </h3>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={refreshCards}
              className="btn-prepaid-primary btn-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      {/* App Header */}
      <AppHeader />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <PageBreadcrumb items={breadcrumbItems} className="mb-8" />

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

        {/* Card Statistics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="stat-prepaid">
            <div className="stat-prepaid-number">{stats.completed}</div>
            <div className="stat-prepaid-label">Completed Cards</div>
          </div>
          <div className="stat-prepaid">
            <div className="stat-prepaid-number">{stats.total}</div>
            <div className="stat-prepaid-label">Total Cards</div>
          </div>
        </motion.div>

        {/* Cards Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <CardsTable
            cards={completedCards}
            isLoading={isLoading}
            onCardClick={handleCardClick}
          />
        </motion.div>

        {/* Create New Card Button */}
        {completedCards.length > 0 && (
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
}

export default MyCardsPage;
