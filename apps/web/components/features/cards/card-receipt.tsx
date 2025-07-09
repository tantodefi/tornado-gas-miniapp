//file:prepaid-gas-website/apps/web/components/features/cards/card-receipt.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ExternalLink, X } from "lucide-react";
import { PoolCard } from "@/types";
import { formatJoiningFee, getExplorerUrl } from "@/utils";
import QRCode from "react-qr-code";

interface CardReceiptProps {
  card: PoolCard;
  showRecoveryPhrase?: boolean;
  onClose: () => void;
}

/**
 * CardReceipt Component
 *
 * Reusable receipt-like component for displaying card details
 * Used for both payment success and viewing existing cards
 */
const CardReceipt: React.FC<CardReceiptProps> = ({
  card,
  showRecoveryPhrase = false,
  onClose,
}) => {
  const [contextCopied, setContextCopied] = useState(false);
  const [recoveryPhraseSaved, setRecoveryPhraseSaved] = useState(false);

  // Generate explorer URL
  const explorerUrl = getExplorerUrl(card.chainId, card.transactionHash);

  // Helper functions
  const copyPaymasterContext = async () => {
    try {
      await navigator.clipboard.writeText(card.paymasterContext);
      setContextCopied(true);
      setTimeout(() => setContextCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy context:", error);
      alert("Failed to copy. Please select and copy manually.");
    }
  };

  const handleExplorerClick = () => {
    window.open(explorerUrl, "_blank", "noopener,noreferrer");
  };

  const formatTransactionHash = (hash: string) => {
    if (!hash || hash.length < 10) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="max-w-md w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-2 text-white">
            Gas Card Receipt
          </h1>
          <p className="text-slate-400">💳 Your prepaid gas credit details</p>
        </motion.div>

        {/* Receipt Container */}
        <motion.div
          className="card-prepaid-glass rounded-2xl overflow-hidden relative shadow-2xl border-0"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.4,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Section - QR Code */}
          <motion.div
            className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 text-white relative"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-center mb-4">
              <p className="text-purple-200 text-sm mb-4">
                Demo App Configuration Code
              </p>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <QRCode
                    value={card.paymasterContext}
                    size={140}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
                <button
                  onClick={copyPaymasterContext}
                  className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm transition-colors border border-white/20"
                >
                  {contextCopied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tear Line */}
          <div className="relative bg-slate-800/50 border-t-2 border-dashed border-slate-600/50">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black/90 border-0" />
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-black/90 border-0" />
            <div className="border-t-2 border-dashed border-slate-600/50 mx-6" />
          </div>

          {/* Bottom Section - Card Details */}
          <motion.div
            className="p-8 bg-slate-500/20 space-y-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {/* Card Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              {/* Card Type */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Card Type
                </p>
                <p className="text-lg font-semibold text-white">
                  {card.poolInfo.paymasterType === "GasLimited"
                    ? "Multi-Use"
                    : "One-Time-Use"}
                </p>
              </div>

              {/* Pool ID */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Pool ID
                </p>
                <p className="text-lg font-semibold text-white">
                  {card.poolInfo.poolId}
                </p>
              </div>

              {/* Amount */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Amount
                </p>
                <p className="text-lg font-semibold text-white">
                  {formatJoiningFee(card.poolInfo.joiningFee)} ETH
                </p>
              </div>

              {/* Purchased Date */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Purchased
                </p>
                <p className="text-lg font-semibold text-white">
                  {formatDate(card.purchasedAt)}
                </p>
              </div>

              {/* Transaction */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Transaction
                </p>
                <button
                  onClick={handleExplorerClick}
                  className="text-lg font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 group"
                  title="View transaction on explorer"
                >
                  <span>{formatTransactionHash(card.transactionHash)}</span>
                  <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Network */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Network
                </p>
                <p className="text-lg font-semibold text-white capitalize">
                  {card.poolInfo.network}
                </p>
              </div>

              {/* Balance */}
              <div className="sm:col-span-2">
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Current Balance
                </p>
                <p className="text-lg font-semibold text-green-400">
                  {parseFloat(card.balance).toFixed(6)} ETH
                </p>
              </div>
            </div>

            {/* Recovery Phrase Section - Conditional */}
            {showRecoveryPhrase && (
              <div className="border-t border-slate-600/50 pt-6">
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-3">
                  Recovery Phrase
                </p>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    {card.identity.mnemonic.split(" ").map((word, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs w-6">
                          {index + 1}.
                        </span>
                        <span className="text-white font-mono">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recovery Phrase Confirmation */}
                <div className="mb-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={recoveryPhraseSaved}
                      onChange={(e) => setRecoveryPhraseSaved(e.target.checked)}
                      className="mt-1 w-5 h-5 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <div className="text-sm">
                      <div className="text-white font-medium group-hover:text-green-400 transition-colors">
                        I have saved my recovery phrase
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        Keep this safe - it's the only way to recover your card
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <button
                onClick={onClose}
                disabled={showRecoveryPhrase && !recoveryPhraseSaved}
                className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-300 ${
                  showRecoveryPhrase && !recoveryPhraseSaved
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "btn-prepaid-primary hover:scale-[1.02]"
                }`}
              >
                {showRecoveryPhrase && !recoveryPhraseSaved
                  ? "Save Recovery Phrase First"
                  : "Close"}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CardReceipt;
