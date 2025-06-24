"use client";

import React from "react";
import { motion } from "framer-motion";
import type { IssuedCard } from "@/lib/storage/card-storage";
import InactiveCardDisplay from "./inactive-card-display";

interface CardSuccessDisplayProps {
  card: IssuedCard;
  onTopUp: () => void;
  onIssueAnother: () => void;
}

/**
 * Card success display component
 * Single responsibility: Show successful card issuance with next actions
 * Displays card details and provides clear next steps for the user
 */
const CardSuccessDisplay: React.FC<CardSuccessDisplayProps> = ({
  card,
  onTopUp,
  onIssueAnother,
}) => {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Success celebration */}
      <motion.div
        className="mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-2xl font-bold text-green-400 mb-2">
          Card Issued Successfully!
        </h2>
        <p className="text-slate-300 max-w-md mx-auto">
          Your new prepaid gas card is ready. Top it up to start using it for
          anonymous transactions.
        </p>
      </motion.div>

      {/* Card display */}
      <div className="mb-8">
        <InactiveCardDisplay card={card} onTopUp={onTopUp} />
      </div>

      {/* Card details panel */}
      <motion.div
        className="card-prepaid-glass card-content-md max-w-md mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Card Details</h3>
        <div className="space-y-3 text-left">
          <DetailRow
            label="Card ID"
            value={card.id}
            valueClassName="text-purple-400 font-mono"
          />
          <DetailRow
            label="Account"
            value={card.accountNumber}
            valueClassName="text-white font-mono"
          />
          <DetailRow
            label="Status"
            value="Inactive (Requires Top-up)"
            valueClassName="text-red-400"
          />
          <DetailRow
            label="Issued"
            value={new Date(card.issuedAt).toLocaleString()}
            valueClassName="text-white"
          />
          <DetailRow
            label="Expires"
            value={new Date(card.expiresAt).toLocaleDateString()}
            valueClassName="text-white"
          />
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="flex gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <button onClick={onIssueAnother} className="btn-prepaid-outline btn-md">
          Issue Another Card
        </button>
        <button onClick={onTopUp} className="btn-prepaid-primary btn-md">
          Top Up Now →
        </button>
      </motion.div>
    </motion.div>
  );
};

/**
 * Reusable detail row component for card information
 */
interface DetailRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  valueClassName = "text-white",
}) => (
  <div className="flex justify-between">
    <span className="text-slate-400">{label}:</span>
    <span className={valueClassName}>{value}</span>
  </div>
);

/**
 * Minimal success display for compact layouts
 */
export const CompactCardSuccess: React.FC<{
  card: IssuedCard;
  onTopUp: () => void;
}> = ({ card, onTopUp }) => (
  <motion.div
    className="text-center p-6 card-prepaid-glass card-content-sm"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-3xl mb-2">✨</div>
    <h3 className="text-lg font-bold text-green-400 mb-2">Card Issued!</h3>
    <p className="text-sm text-slate-300 mb-4">{card.id} is ready for top-up</p>
    <button onClick={onTopUp} className="btn-prepaid-primary btn-sm w-full">
      Top Up Now →
    </button>
  </motion.div>
);

/**
 * Success display with confetti animation
 */
export const CelebratedCardSuccess: React.FC<CardSuccessDisplayProps> = (
  props,
) => {
  return (
    <div className="relative">
      {/* Confetti effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500 rounded"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              rotate: [0, 360],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>

      {/* Main success display */}
      <CardSuccessDisplay {...props} />
    </div>
  );
};

export default CardSuccessDisplay;
