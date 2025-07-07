//file:prepaid-gas-website/apps/web/components/features/identity/secure-success-screen.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import {
  formatMnemonicForDisplay,
  type GenerateIdentityResult,
} from "@/lib/identity/generator";
import { Pool, PoolCard } from "@/types";
import { formatJoiningFee } from "@/utils";
import QRCode from "react-qr-code";

/**
 * Interface for pool data needed by success screen
 */
interface PoolData {
  poolId: string;
  joiningFee: string;
  network: {
    name: string;
  };
}

/**
 * Props for SecureSuccessScreen component
 */
interface SecureSuccessScreenProps {
  /** Activated card data */
  card: PoolCard;
  /** Generated identity with recovery phrase */
  identity: GenerateIdentityResult;
  /** Pool data for display */
  pool: Pool;
  /** Handler called when user completes the flow */
  onComplete: () => void;
}

/**
 * Elegant SecureSuccessScreen Component
 *
 * Focused on essential information:
 * - Success celebration
 * - Recovery phrase display
 * - Paymaster context for demo app
 * - Simple confirmation
 * - Clear action
 */
const SecureSuccessScreen: React.FC<SecureSuccessScreenProps> = ({
  card,
  identity,
  pool,
  onComplete,
}) => {
  const [recoveryPhraseSaved, setRecoveryPhraseSaved] = useState(false);
  const [contextCopied, setContextCopied] = useState(false);
  // const formattedWords = formatMnemonicForDisplay(identity.mnemonic);

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!recoveryPhraseSaved) {
        e.preventDefault();
        e.returnValue = "Save your recovery phrase before leaving!";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [recoveryPhraseSaved]);

  const handleComplete = () => {
    if (recoveryPhraseSaved) {
      onComplete();
    }
  };

  // Copy paymaster context to clipboard
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

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="max-w-md w-full max-h-[85vh] overflow-y-auto">
        {/* Success title */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-2 text-white">
            Payment Successful!
          </h1>
          <p className="text-slate-400">🎉 Your gas credit is ready to use</p>
        </motion.div>

        {/* Success Ticket Container */}
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
          {/* Top Section - QR Code */}
          <motion.div
            className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 text-white relative"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-center mb-4">
              <p className="text-purple-200 text-sm mb-4">
                Save this code to configure your gas credit
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
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tear Line Section */}
          <div className="relative bg-slate-800/50 border-t-2 border-dashed border-slate-600/50">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black/90 border-0" />
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-black/90 border-0" />
            <div className="border-t-2 border-dashed border-slate-600/50 mx-6" />
          </div>

          {/* Bottom Section - Purchase Details */}
          <motion.div
            className="p-8 bg-slate-500/20 space-y-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {/* Grid layout for detail items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              {/* Credit Type */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Credit Type
                </p>
                <p className="text-lg font-semibold text-white">
                  {pool.paymaster.contractType === "GasLimited"
                    ? "Multi-Use"
                    : "One-Time-Use"}
                </p>
              </div>

              {/* Pool Id */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Pool Id
                </p>
                <p className="text-lg font-semibold text-white">
                  {pool.poolId}
                </p>
              </div>

              {/* Amount */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Amount
                </p>
                <p className="text-lg font-semibold text-white">
                  {formatJoiningFee(pool.joiningFee)} ETH
                </p>
              </div>

              {/* Purchase Date */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Purchased
                </p>
                <p className="text-lg font-semibold text-white">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Transaction Details */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Transaction
                </p>
                <p className="text-lg font-semibold text-white capitalize">
                  View on explorer
                </p>
              </div>

              {/* Network */}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Network
                </p>
                <p className="text-lg font-semibold text-white capitalize">
                  {pool.network}
                </p>
              </div>
            </div>

            {/* Recovery confirmation */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={recoveryPhraseSaved}
                  onChange={(e) => setRecoveryPhraseSaved(e.target.checked)}
                  className="mt-1 w-5 h-5 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500 focus:ring-2"
                />
                <div className="text-sm">
                  <div className="text-white font-medium group-hover:text-green-400 transition-colors">
                    I have save it
                  </div>
                  <div className="text-slate-400 text-xs mt-1">
                    Keep this safe - it's the only way to recover your card
                  </div>
                </div>
              </label>
            </div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <button
                onClick={handleComplete}
                disabled={!recoveryPhraseSaved}
                className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-300 ${
                  recoveryPhraseSaved
                    ? "btn-prepaid-primary hover:scale-[1.02]"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                {recoveryPhraseSaved ? "Continue to Dashboard →" : "Save"}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SecureSuccessScreen;
