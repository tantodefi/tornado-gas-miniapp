//file:prepaid-gas-website/apps/web/components/features/identity/secure-success-screen.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  formatMnemonicForDisplay,
  type GenerateIdentityResult,
} from "@/lib/identity/generator";
import { PoolCard } from "@/types";

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
  pool: PoolData;
  /** Handler called when user completes the flow */
  onComplete: () => void;
}

/**
 * Elegant SecureSuccessScreen Component
 *
 * Focused on essential information:
 * - Success celebration
 * - Recovery phrase display
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
  const formattedWords = formatMnemonicForDisplay(identity.mnemonic);

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

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <motion.div
          className="bg-slate-900 border border-green-500/30 rounded-2xl p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-green-400 mb-2">
              Gas Card Activated!
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Pool {pool.poolId} • {card.id}
            </div>
          </div>

          {/* Critical Warning - Simplified */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-amber-400 text-xl">⚠️</div>
              <h2 className="text-amber-400 font-bold">
                Save Your Recovery Phrase
              </h2>
            </div>
            <p className="text-amber-200 text-sm">
              Write these 12 words on paper. This is your only chance to see
              them.
            </p>
          </div>

          {/* Recovery Phrase - Cleaner Display */}
          <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-3">
              {formattedWords.map(({ index, word }) => (
                <div
                  key={index}
                  className="bg-slate-700/50 rounded-lg p-3 text-center"
                >
                  <div className="text-xs text-slate-400 mb-1">{index}</div>
                  <div className="text-white font-mono text-sm font-semibold">
                    {word}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simple Confirmation */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={recoveryPhraseSaved}
                onChange={(e) => setRecoveryPhraseSaved(e.target.checked)}
                className="mt-1 w-5 h-5 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
              />
              <div className="text-sm">
                <div className="text-white font-medium group-hover:text-green-400 transition-colors">
                  I have written down all 12 words on paper
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  Keep this safe - it's the only way to recover your card
                </div>
              </div>
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={handleComplete}
            disabled={!recoveryPhraseSaved}
            className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-300 ${
              recoveryPhraseSaved
                ? "btn-prepaid-primary hover:scale-[1.02]"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            {recoveryPhraseSaved
              ? "Continue to My Cards →"
              : "Please save your recovery phrase first"}
          </button>

          {recoveryPhraseSaved && (
            <motion.p
              className="text-green-400 text-sm text-center mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ✅ Your gas card is ready for anonymous transactions!
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SecureSuccessScreen;
