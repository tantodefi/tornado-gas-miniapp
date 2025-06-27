"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  getCardsByStatus,
  deleteCardFromIndexedDB,
  getCardStatsFromIndexedDB,
} from "@/lib/storage/indexed-db";
import { LabelHeader } from "../../layout/page-header";
import { formatMnemonicForDisplay } from "@/lib/identity/generator";
import { PoolCard } from "@/types";

interface PendingCardsPageProps {
  // No props needed
}

/**
 * Pending Cards Management Page
 * Shows cards that have been created but not yet topped up
 */
const PendingCardsPage: React.FC<PendingCardsPageProps> = () => {
  const router = useRouter();
  const [pendingCards, setPendingCards] = useState<PoolCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMnemonic, setShowMnemonic] = useState<string | null>(null);
  const [cardStats, setCardStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    totalValue: 0,
  });

  // Load pending cards on mount
  useEffect(() => {
    loadPendingCards();
    loadCardStats();
  }, []);

  const loadPendingCards = async () => {
    try {
      setIsLoading(true);
      const cards = await getCardsByStatus("pending-topup");
      setPendingCards(cards);
    } catch (error) {
      console.error("Failed to load pending cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCardStats = async () => {
    try {
      const stats = await getCardStatsFromIndexedDB();
      setCardStats(stats);
    } catch (error) {
      console.error("Failed to load card stats:", error);
    }
  };

  const handleTopUpCard = (cardId: string, poolId: string) => {
    router.push(`/cards/topup?card=${cardId}&pool=${poolId}`);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this card? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteCardFromIndexedDB(cardId);
      await loadPendingCards();
      await loadCardStats();
    } catch (error) {
      console.error("Failed to delete card:", error);
      alert("Failed to delete card. Please try again.");
    }
  };

  const handleShowMnemonic = (cardId: string) => {
    setShowMnemonic(cardId);
  };

  const handleHideMnemonic = () => {
    setShowMnemonic(null);
  };

  const handleBack = () => {
    router.push("/pools");
  };

  const handleCreateNewCard = () => {
    router.push("/pools");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LabelHeader
            backText="← Back to Pools"
            onBack={handleBack}
            label="Pending Cards"
          />

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <LabelHeader
          backText="← Back to Pools"
          onBack={handleBack}
          label="Pending Cards"
        />

        {/* Page Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="heading-prepaid-section mb-4">
            <span className="text-prepaid-gradient-white">Your </span>
            <span className="text-prepaid-gradient-brand">Gas Cards</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Manage your prepaid gas cards. Complete the top-up process to
            activate them.
          </p>
        </motion.div>

        {/* Card Statistics */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="stat-prepaid">
            <div className="stat-prepaid-number">{cardStats.total}</div>
            <div className="stat-prepaid-label">Total Cards</div>
          </div>
          <div className="stat-prepaid">
            <div className="stat-prepaid-number">{cardStats.pending}</div>
            <div className="stat-prepaid-label">Pending</div>
          </div>
          <div className="stat-prepaid">
            <div className="stat-prepaid-number">{cardStats.active}</div>
            <div className="stat-prepaid-label">Active</div>
          </div>
          <div className="stat-prepaid">
            <div className="stat-prepaid-number">
              {cardStats.totalValue.toFixed(3)}
            </div>
            <div className="stat-prepaid-label">ETH Value</div>
          </div>
        </motion.div>

        {/* Cards List */}
        {pendingCards.length === 0 ? (
          <EmptyState onCreateCard={handleCreateNewCard} />
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {pendingCards.map((card, index) => (
              <PendingCardItem
                key={card.id}
                card={card}
                index={index}
                onTopUp={() => handleTopUpCard(card.id, card.poolId)}
                onDelete={() => handleDeleteCard(card.id)}
                onShowMnemonic={() => handleShowMnemonic(card.id)}
                showMnemonic={showMnemonic === card.id}
                onHideMnemonic={handleHideMnemonic}
              />
            ))}
          </motion.div>
        )}

        {/* Create New Card Button */}
        {pendingCards.length > 0 && (
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
              + Create Another Card
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

/**
 * Empty state when no pending cards exist
 */
interface EmptyStateProps {
  onCreateCard: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateCard }) => (
  <motion.div
    className="text-center py-16"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.2 }}
  >
    <div className="text-6xl mb-6">💳</div>
    <h2 className="text-2xl font-bold text-white mb-4">No Gas Cards Yet</h2>
    <p className="text-slate-300 mb-8 max-w-md mx-auto">
      You haven't created any gas cards yet. Browse pools and join one to create
      your first prepaid gas card.
    </p>
    <button onClick={onCreateCard} className="btn-prepaid-primary btn-lg">
      Browse Pools & Create Card →
    </button>
  </motion.div>
);

/**
 * Individual pending card item
 */
interface PendingCardItemProps {
  card: PoolCard;
  index: number;
  onTopUp: () => void;
  onDelete: () => void;
  onShowMnemonic: () => void;
  showMnemonic: boolean;
  onHideMnemonic: () => void;
}

const PendingCardItem: React.FC<PendingCardItemProps> = ({
  card,
  index,
  onTopUp,
  onDelete,
  onShowMnemonic,
  showMnemonic,
  onHideMnemonic,
}) => (
  <motion.div
    className="card-prepaid-glass card-content-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
      {/* Card Info */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{card.id}</h3>
            <p className="text-sm text-slate-400">
              Pool {card.poolId} • {card.poolDetails.network.name}
            </p>
          </div>
          <div className="text-xs px-2 py-1 rounded font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            PENDING TOP-UP
          </div>
        </div>

        {/* Card Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-slate-400 mb-1">Joining Fee</div>
            <div className="text-purple-400 font-bold">
              {parseFloat(card.poolDetails.joiningFee).toFixed(4)} ETH
            </div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-slate-400 mb-1">Created</div>
            <div className="text-white">
              {new Date(card.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Identity Info */}
        <div className="bg-slate-800/20 rounded-lg p-3 mb-4">
          <div className="text-xs text-slate-400 mb-2">Identity Commitment</div>
          <div className="font-mono text-xs text-purple-400 break-all">
            {card.identity.commitment.slice(0, 32)}...
            {card.identity.commitment.slice(-8)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 lg:min-w-[200px]">
        <button onClick={onTopUp} className="btn-prepaid-primary btn-md w-full">
          Top Up & Activate →
        </button>

        <button
          onClick={showMnemonic ? onHideMnemonic : onShowMnemonic}
          className="btn-prepaid-outline btn-sm w-full"
        >
          {showMnemonic ? "Hide Recovery Phrase" : "Show Recovery Phrase"}
        </button>

        <button
          onClick={onDelete}
          className="btn-prepaid-outline btn-sm w-full text-red-400 border-red-500/30 hover:bg-red-500/10"
        >
          Delete Card
        </button>
      </div>
    </div>

    {/* Mnemonic Display */}
    <AnimatePresence>
      {showMnemonic && (
        <motion.div
          className="mt-6 pt-6 border-t border-slate-600/30"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-red-400">⚠️</div>
              <h4 className="text-red-400 font-bold text-sm">
                Recovery Phrase
              </h4>
            </div>
            <p className="text-red-300 text-xs">
              Keep this safe! Anyone with these words can access your gas card.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 justify-items-start">
            {formatMnemonicForDisplay(card.identity.mnemonic).map(
              ({ index, word }) => (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-slate-600/50 rounded p-2 text-left"
                >
                  <div className="text-xs text-slate-400">{index}</div>
                  <div className="text-sm text-white font-mono">{word}</div>
                </div>
              ),
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default PendingCardsPage;
