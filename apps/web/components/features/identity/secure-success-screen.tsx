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
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
          {/* <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-6">
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
          </div> */}

          {/* Recovery Phrase - Cleaner Display */}
          {/* <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-6 mb-6">
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
          </div> */}

          {/* NEW: Paymaster Context Section */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
            {/* <div className="flex items-center gap-3 mb-3">
              <div className="text-blue-400 text-xl">🎫</div>
              <h2 className="text-blue-400 font-bold">
                Demo App Configuration
              </h2>
            </div> */}
            <p className="text-blue-200 text-sm mb-4">
              Copy this code to configure the your prepaid gas paymaster with
              your gas card:
            </p>

            <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-mono">
                  Paymaster Context
                </span>
                <button
                  onClick={copyPaymasterContext}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition-colors"
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
              <div className="bg-slate-900/50 rounded p-3 font-mono text-xs text-green-400 break-all leading-relaxed">
                {card.paymasterContext}
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              💡 Paste this into the demo app to use your gas card for anonymous
              transactions
            </p>
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
                  I have written down
                  {/* all 12 words on paper */}
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
            {recoveryPhraseSaved ? "Continue to Dashboard →" : "Save"}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SecureSuccessScreen;
