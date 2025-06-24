"use client";

import React from "react";
import { motion } from "framer-motion";
import type { IssuedCard } from "@/lib/storage/card-storage";

interface InactiveCardDisplayProps {
  card: IssuedCard;
  onTopUp: () => void;
}

/**
 * Inactive card display component
 * Single responsibility: Show an inactive card with top-up call-to-action
 * Reusable component for displaying any inactive prepaid gas card
 */
const InactiveCardDisplay: React.FC<InactiveCardDisplayProps> = ({
  card,
  onTopUp,
}) => {
  return (
    <motion.div
      className="perspective-1000"
      initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Card container */}
      <div className="w-full max-w-[400px] h-[240px] mx-auto bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl border border-slate-500/50 relative shadow-xl overflow-hidden">
        {/* Inactive overlay */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-sm font-bold text-red-400 mb-1">INACTIVE</div>
            <div className="text-xs text-slate-400">
              Requires top-up to activate
            </div>
          </div>
        </div>

        {/* Card content (grayed out) */}
        <div className="p-6 h-full flex flex-col justify-between opacity-50">
          {/* Card header */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-start">
              <div className="text-sm text-pink-500 font-bold">PREPAID</div>
              <div className="text-xs text-slate-500">GAS CREDIT</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-slate-500">-- ETH</div>
              <div className="text-xs text-slate-500">Not activated</div>
            </div>
          </div>

          {/* Card footer */}
          <div className="flex justify-between items-end">
            <div className="font-mono text-sm text-slate-500">
              {card.accountNumber}
            </div>
            <div className="text-sm text-slate-500 px-2 py-1 rounded bg-slate-700">
              🔄 Pending
            </div>
          </div>
        </div>

        {/* Pulse effect for inactive state */}
        <motion.div
          className="absolute inset-0 border-2 border-red-500/30 rounded-2xl"
          animate={{
            borderColor: [
              "rgba(239, 68, 68, 0.3)",
              "rgba(239, 68, 68, 0.1)",
              "rgba(239, 68, 68, 0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Top-up call-to-action */}
      <motion.div
        className="text-center mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <button onClick={onTopUp} className="btn-prepaid-primary btn-lg mb-3">
          Top Up & Activate Card →
        </button>
        <p className="text-xs text-slate-400">
          Fund your card to start using prepaid gas
        </p>
      </motion.div>
    </motion.div>
  );
};

/**
 * Compact version for use in lists or grids
 */
export const CompactInactiveCard: React.FC<InactiveCardDisplayProps> = ({
  card,
  onTopUp,
}) => {
  return (
    <motion.div
      className="card-prepaid-glass card-content-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-bold text-purple-400">{card.id}</div>
          <div className="text-xs text-slate-400 font-mono">
            {card.accountNumber}
          </div>
        </div>
        <div className="text-xs px-2 py-1 rounded font-bold bg-red-500/20 text-red-400">
          INACTIVE
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-3">
        Issued: {new Date(card.issuedAt).toLocaleDateString()}
      </div>

      <button onClick={onTopUp} className="btn-prepaid-primary btn-sm w-full">
        Top Up & Activate
      </button>
    </motion.div>
  );
};

export default InactiveCardDisplay;
