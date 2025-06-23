"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCardIssuance } from "@/hooks/use-card-issuance";

// Types for issued cards
interface IssuedCard {
  id: string;
  accountNumber: string;
  issuedAt: string;
  status: "inactive" | "active";
  network?: {
    name: string;
    icon: string;
    color: string;
  };
  amount?: number;
  expiresAt: string;
}

interface CardIssuanceFlowProps {
  onCardIssued?: (card: IssuedCard) => void;
  onTopUpCard?: (cardId: string) => void;
  onBack?: () => void;
}

// Card printing animation component
const CardPrintingAnimation: React.FC<{
  isVisible: boolean;
  onComplete: () => void;
}> = ({ isVisible, onComplete }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        {/* Card printer machine */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Printer body */}
          <div className="w-64 h-32 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg border border-slate-600 relative overflow-hidden">
            {/* Printer screen */}
            <div className="absolute top-4 left-4 w-16 h-8 bg-green-400 rounded border border-green-500">
              <motion.div
                className="w-full h-full bg-green-300 rounded"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>

            {/* Printer buttons */}
            <div className="absolute top-4 right-4 flex gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            {/* Card slot */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-slate-900 rounded-t border-l border-r border-t border-slate-600">
              {/* Card being printed */}
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-28 h-16 bg-gradient-to-br from-slate-800 to-slate-600 rounded border border-purple-500/30"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: -10, opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
                onAnimationComplete={() => {
                  setTimeout(onComplete, 1000);
                }}
              >
                {/* Card details being "printed" */}
                <div className="p-2 h-full flex flex-col justify-between text-xs">
                  <motion.div
                    className="text-pink-500 font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                  >
                    PREPAID
                  </motion.div>
                  <motion.div
                    className="text-purple-500 font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 0.5 }}
                  >
                    NEW CARD
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Printer activity lights */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(139, 69, 19, 0)",
                  "0 0 20px rgba(139, 69, 19, 0.5)",
                  "0 0 0 rgba(139, 69, 19, 0)",
                ],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Status text */}
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-2 text-purple-400">
            Issuing Your Card
          </h3>
          <motion.p
            className="text-slate-300"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Creating secure prepaid gas card...
          </motion.p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Inactive card display component
const InactiveCard: React.FC<{
  card: IssuedCard;
  onTopUp: () => void;
}> = ({ card, onTopUp }) => {
  return (
    <motion.div
      className="perspective-1000"
      initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
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

      {/* Top-up button */}
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

// Card success display component
const CardIssuedSuccess: React.FC<{
  card: IssuedCard;
  onTopUp: () => void;
  onIssueAnother: () => void;
}> = ({ card, onTopUp, onIssueAnother }) => {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Success message */}
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
        <InactiveCard card={card} onTopUp={onTopUp} />
      </div>

      {/* Card details */}
      <motion.div
        className="card-prepaid-glass card-content-md max-w-md mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Card Details</h3>
        <div className="space-y-3 text-left">
          <div className="flex justify-between">
            <span className="text-slate-400">Card ID:</span>
            <span className="text-purple-400 font-mono">{card.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Account:</span>
            <span className="text-white font-mono">{card.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="text-red-400">Inactive (Requires Top-up)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Issued:</span>
            <span className="text-white">
              {new Date(card.issuedAt).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Expires:</span>
            <span className="text-white">
              {new Date(card.expiresAt).toLocaleDateString()}
            </span>
          </div>
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

// Main card issuance flow component
const CardIssuanceFlow: React.FC<CardIssuanceFlowProps> = ({
  onCardIssued,
  onTopUpCard,
  onBack,
}) => {
  const { issuedCards, isIssuing, issueNewCard, getCardById } =
    useCardIssuance();

  const [showAnimation, setShowAnimation] = useState(false);
  const [currentCard, setCurrentCard] = useState<IssuedCard | null>(null);
  const [flowState, setFlowState] = useState<"initial" | "issuing" | "success">(
    "initial",
  );

  const handleIssueCard = async () => {
    setFlowState("issuing");
    setShowAnimation(true);
  };

  const handleAnimationComplete = async () => {
    setShowAnimation(false);

    // Issue the card
    const newCard = await issueNewCard();
    setCurrentCard(newCard);
    setFlowState("success");

    // Notify parent component
    onCardIssued?.(newCard);
  };

  const handleTopUpCard = () => {
    if (currentCard) {
      onTopUpCard?.(currentCard.id);
    }
  };

  const handleIssueAnother = () => {
    setCurrentCard(null);
    setFlowState("initial");
  };

  const handleBack = () => {
    onBack?.();
  };

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBack}
            className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono"
          >
            ← Back
          </button>
          <div className="text-xs text-slate-500 font-mono">Card Issuance</div>
        </div>

        {/* Content based on flow state */}
        <AnimatePresence mode="wait">
          {flowState === "initial" && (
            <motion.div
              key="initial"
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1
                className="heading-prepaid-section mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <span className="text-prepaid-gradient-white">Get Your </span>
                <span className="text-prepaid-gradient-brand">Gas Card</span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Issue a new prepaid gas card instantly. No network calls
                required - your card is generated locally with a unique secure
                ID.
              </motion.p>

              {/* Issue card button */}
              <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <button
                  onClick={handleIssueCard}
                  disabled={isIssuing}
                  className="btn-prepaid-primary btn-lg"
                >
                  {isIssuing ? "Issuing Card..." : "Issue New Card ✨"}
                </button>
                <p className="text-xs text-slate-400 mt-3">
                  Instant issuance • No network required • Secure local
                  generation
                </p>
              </motion.div>

              {/* Existing cards */}
              {issuedCards.length > 0 && (
                <motion.div
                  className="text-left"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                >
                  <h3 className="text-xl font-bold text-white mb-6 text-center">
                    Your Issued Cards
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {issuedCards.map((card, index) => (
                      <motion.div
                        key={card.id}
                        className="card-prepaid-glass card-content-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-sm font-bold text-purple-400">
                              {card.id}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {card.accountNumber}
                            </div>
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded font-bold ${
                              card.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {card.status.toUpperCase()}
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 mb-3">
                          Issued: {new Date(card.issuedAt).toLocaleDateString()}
                        </div>

                        {card.status === "inactive" && (
                          <button
                            onClick={() => onTopUpCard?.(card.id)}
                            className="btn-prepaid-primary btn-sm w-full"
                          >
                            Top Up & Activate
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {flowState === "success" && currentCard && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <CardIssuedSuccess
                card={currentCard}
                onTopUp={handleTopUpCard}
                onIssueAnother={handleIssueAnother}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card printing animation overlay */}
        <AnimatePresence>
          <CardPrintingAnimation
            isVisible={showAnimation}
            onComplete={handleAnimationComplete}
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CardIssuanceFlow;
