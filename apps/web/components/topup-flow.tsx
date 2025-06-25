"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  findCardInIndexedDB,
  type PoolCard,
} from "@/lib/storage/indexed-db-storage";
import { usePoolDetails } from "@/hooks/use-pool-details";
import { LabelHeader } from "./ui/page-header";
import PrepaidPoolCard from "./ui/prepaid-pool-card";

/**
 * Top-up flow component that handles different entry points
 * Supports: ?card=ID&pool=ID or ?pool=ID (for new cards)
 */
const TopUpFlow: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL parameters
  const cardId = searchParams.get("card");
  const poolId = searchParams.get("pool");

  // State
  const [card, setCard] = useState<PoolCard | null>(null);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [cardNotFound, setCardNotFound] = useState(false);

  // Pool details hook
  const {
    pool,
    isLoading: isLoadingPool,
    error: poolError,
  } = usePoolDetails(
    poolId || "",
    false, // Don't load members for topup
    0,
  );

  // Load card if cardId is provided
  useEffect(() => {
    const loadCard = async () => {
      if (!cardId) return;

      try {
        setIsLoadingCard(true);
        setCardNotFound(false);

        const foundCard = await findCardInIndexedDB(cardId);
        if (foundCard) {
          setCard(foundCard);
        } else {
          setCardNotFound(true);
        }
      } catch (error) {
        console.error("Failed to load card:", error);
        setCardNotFound(true);
      } finally {
        setIsLoadingCard(false);
      }
    };

    loadCard();
  }, [cardId]);

  // Navigation handlers
  const handleBack = () => {
    if (card) {
      router.push("/cards/pending");
    } else {
      router.push("/pools");
    }
  };

  const handleConnectWallet = () => {
    // TODO: Implement wallet connection
    alert("Wallet connection will be implemented next!");
  };

  // Loading states
  if (isLoadingCard || isLoadingPool) {
    return (
      <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LabelHeader
            backText="← Back"
            onBack={handleBack}
            label="Top-up Flow"
          />

          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚡</div>
            <div className="text-xl text-white animate-pulse">
              {isLoadingCard
                ? "Loading your card..."
                : "Loading pool details..."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (cardNotFound) {
    return (
      <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LabelHeader
            backText="← Back to My Cards"
            onBack={() => router.push("/cards/pending")}
            label="Card Not Found"
          />

          <div className="text-center py-16">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Card Not Found
            </h2>
            <p className="text-slate-300 mb-8 max-w-md mx-auto">
              The card you're looking for doesn't exist or may have been
              deleted.
            </p>
            <button
              onClick={() => router.push("/cards/pending")}
              className="btn-prepaid-primary btn-md"
            >
              View My Cards
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (poolError || (!pool && poolId)) {
    return (
      <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LabelHeader
            backText="← Back to Pools"
            onBack={() => router.push("/pools")}
            label="Pool Error"
          />

          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Pool Not Found
            </h2>
            <p className="text-slate-300 mb-8 max-w-md mx-auto">
              {poolError || "The pool you're trying to join doesn't exist."}
            </p>
            <button
              onClick={() => router.push("/pools")}
              className="btn-prepaid-primary btn-md"
            >
              Browse Pools
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <LabelHeader
          backText={card ? "← Back to My Cards" : "← Back to Pools"}
          onBack={handleBack}
          label="Top-up Flow"
        />

        {/* Page Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="heading-prepaid-section mb-4">
            <span className="text-prepaid-gradient-white">Top Up </span>
            <span className="text-prepaid-gradient-brand">Gas Card</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {card
              ? `Complete the payment to activate your gas card and join Pool ${poolId}.`
              : `Connect your wallet and join Pool ${poolId} with a prepaid gas payment.`}
          </p>
        </motion.div>

        {/* Card Details Section */}
        {card && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              Your Gas Card
            </h2>
            <div className="card-prepaid-glass card-content-md mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">
                    {card.id}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-yellow-400 font-bold">
                        Pending Top-up
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pool ID:</span>
                      <span className="text-white">{card.poolId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Network:</span>
                      <span className="text-white">
                        {card.poolDetails.network.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Created:</span>
                      <span className="text-white">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 mb-2">
                    Identity Commitment
                  </h4>
                  <div className="bg-slate-800/30 rounded p-3 font-mono text-xs text-purple-400 break-all">
                    {card.identity.commitment}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pool Details Section */}
        {pool && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              Pool Details
            </h2>
            <div className="max-w-md mx-auto">
              <PrepaidPoolCard pool={pool} />
            </div>
          </motion.div>
        )}

        {/* Payment Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="card-prepaid-glass card-content-lg text-center max-w-2xl mx-auto">
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Join the Pool?
            </h2>
            <p className="text-slate-300 mb-6">
              Connect your wallet to pay the joining fee and activate your gas
              card. Once activated, you can use anonymous gas payments.
            </p>

            {/* Payment Details */}
            {pool && (
              <div className="bg-slate-800/30 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Joining Fee:</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {parseFloat(pool.joiningFee).toFixed(4)} ETH
                  </span>
                </div>
              </div>
            )}

            {/* Connect Wallet Button */}
            <button
              onClick={handleConnectWallet}
              className="btn-prepaid-primary btn-lg w-full max-w-md mx-auto mb-4"
            >
              Connect Wallet & Pay →
            </button>

            <p className="text-xs text-slate-400">
              This will connect your wallet and process the payment to join Pool{" "}
              {poolId}
            </p>
          </div>
        </motion.div>

        {/* Next Steps Info */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="card-prepaid-glass card-content-md max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-white mb-3">
              What Happens Next?
            </h3>
            <div className="space-y-2 text-sm text-slate-300 text-left">
              <div className="flex items-start gap-2">
                <span className="text-purple-400">1.</span>
                <span>Connect your wallet (MetaMask, WalletConnect, etc.)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">2.</span>
                <span>Pay the joining fee to join the pool</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">3.</span>
                <span>Your gas card becomes active for anonymous payments</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">4.</span>
                <span>Start using prepaid gas for blockchain transactions</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TopUpFlow;
