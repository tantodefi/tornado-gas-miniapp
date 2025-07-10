//file:prepaid-gas-website/apps/web/components/features/cards/cards-table.tsx

"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatJoiningFee } from "@/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { PoolCard } from "@/lib/storage/indexed-db";

interface CardsTableProps {
  cards: PoolCard[];
  isLoading: boolean;
  onCardClick: (card: PoolCard) => void;
}

/**
 * Cards Table Component
 * Single responsibility: Display completed cards in table format
 */
function CardsTable({ cards, isLoading, onCardClick }: CardsTableProps) {
  // Helper functions
  const formatCardId = (cardId: string) => {
    return `${cardId.slice(0, 8)}...${cardId.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  // Loading state
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

  // Empty state
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

  // Table with data
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
        <Table>
          <TableHeader>
            <TableRow className="border-slate-600/30 bg-slate-700/30 hover:bg-slate-700/30">
              <TableHead className="text-slate-300 font-semibold">
                Card ID
              </TableHead>
              <TableHead className="text-slate-300 font-semibold">
                Pool
              </TableHead>
              <TableHead className="text-slate-300 font-semibold">
                Type
              </TableHead>
              <TableHead className="text-slate-300 font-semibold">
                Amount
              </TableHead>
              <TableHead className="text-slate-300 font-semibold">
                Network
              </TableHead>
              <TableHead className="text-slate-300 font-semibold">
                Transaction
              </TableHead>
              <TableHead className="text-slate-300 font-semibold">
                Purchased
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{ display: "contents" }}
              >
                <TableRow
                  className="border-slate-600/20 hover:bg-slate-700/20 cursor-pointer transition-colors duration-200"
                  onClick={() => onCardClick(card)}
                >
                  <TableCell>
                    <span className="text-sm font-mono text-purple-400">
                      {formatCardId(card.id)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-white font-medium">
                      {card.poolInfo.poolId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-300">
                      {card.poolInfo.paymasterType === "GasLimited"
                        ? "Multi-Use"
                        : "One-Time"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-green-400 font-medium">
                      {formatJoiningFee(card.poolInfo.joiningFee)} ETH
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-300 capitalize">
                      {card.poolInfo.network}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-blue-400 font-mono">
                      {formatTxHash(card.transactionHash)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-300">
                      {formatDate(card.purchasedAt)}
                    </span>
                  </TableCell>
                </TableRow>
              </motion.div>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer */}
      <div className="bg-slate-700/30 px-6 py-3 text-center border-t border-slate-600/30">
        <span className="text-xs text-slate-400">
          {cards.length} completed card{cards.length !== 1 ? "s" : ""}
        </span>
      </div>
    </motion.div>
  );
}

export default CardsTable;
