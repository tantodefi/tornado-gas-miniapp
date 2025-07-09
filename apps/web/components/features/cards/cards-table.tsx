//file:prepaid-gas-website/apps/web/components/features/cards/cards-table.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { PoolCard } from "@/types";
import { formatJoiningFee } from "@/utils";

interface CardsTableProps {
  cards: PoolCard[];
  isLoading: boolean;
  onCardClick: (card: PoolCard) => void;
}

/**
 * Cards Table Component - UPDATED for new PoolCard structure
 *
 * Displays all active cards in a clean table format
 * Click any row to view card details in receipt modal
 */
const CardsTable: React.FC<CardsTableProps> = ({
  cards,
  isLoading,
  onCardClick,
}) => {
  const filteredCards = cards.filter((card) => {
    if (card.poolInfo?.poolId) {
      return card;
    }
  });
  // Helper function to format card ID for display
  const formatCardId = (cardId: string) => {
    return `${cardId.slice(0, 8)}...${cardId.slice(-4)}`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to format transaction hash
  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 rounded-xl p-8">
        <div className="text-center text-slate-400">
          <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading cards...
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <motion.div
        className="bg-slate-800/30 rounded-xl p-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-6">💳</div>
        <h3 className="text-xl font-bold text-white mb-4">No Gas Cards Yet</h3>
        <p className="text-slate-400 mb-6">
          You haven't purchased any gas cards yet. Browse pools and join one to
          purchase your first card.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-slate-800/30 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Table Header */}
      <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600/30">
        <h3 className="text-lg font-semibold text-white">Your Gas Cards</h3>
        <p className="text-sm text-slate-400">
          Click any card to view receipt details
        </p>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-600/30 bg-slate-700/30">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Card ID
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Pool
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Balance
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Network
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Transaction
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Purchased
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCards.map((card, index) => (
              <motion.tr
                key={card.id}
                className="border-b border-slate-600/20 hover:bg-slate-700/20 cursor-pointer transition-colors duration-200"
                onClick={() => onCardClick(card)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.002 }}
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-purple-400">
                    {formatCardId(card.id)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-white font-medium">
                    {card.poolInfo.poolId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300">
                    {card.poolInfo.paymasterType === "GasLimited"
                      ? "Multi-Use"
                      : "One-Time"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-green-400 font-medium">
                      {parseFloat(card.balance).toFixed(4)} ETH
                    </span>
                    <span className="text-xs text-slate-500">
                      Paid: {formatJoiningFee(card.poolInfo.joiningFee)} ETH
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300 capitalize">
                    {card.poolInfo.network}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-blue-400 font-mono">
                    {formatTxHash(card.transactionHash)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300">
                    {formatDate(card.purchasedAt)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-slate-700/30 px-6 py-3 text-center">
        <span className="text-xs text-slate-400">
          {cards.length} card{cards.length !== 1 ? "s" : ""} total
        </span>
      </div>
    </motion.div>
  );
};

export default CardsTable;
