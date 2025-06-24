"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCardIssuance } from "@/hooks/use-card-issuance";
import { useCardAnimations } from "@/hooks/business/use-card-animations";
import CardPrintingAnimation from "./cards/card-printing-animation";
import InactiveCardDisplay, {
  CompactInactiveCard,
} from "./cards/inactive-card-display";
import CardSuccessDisplay from "./cards/card-success-display";
import type { IssuedCard } from "@/lib/storage/card-storage";
import { LabelHeader } from "./ui/page-header";

/**
 * Main card issuance flow component
 * Single responsibility: Orchestrate the card issuance flow and navigation
 * Uses focused components and hooks for all business logic
 */
const CardIssuanceFlow: React.FC = () => {
  const router = useRouter();

  // Business logic hooks
  const { issuedCards, isIssuing, issueNewCard } = useCardIssuance();
  const {
    flowState,
    isInInitialState,
    isSuccess,
    showPrintingAnimation,
    startIssuanceFlow,
    completeAnimation,
    resetToInitial,
  } = useCardAnimations();

  // Current card state
  const [currentCard, setCurrentCard] = React.useState<IssuedCard | null>(null);

  // Navigation handlers
  const handleBack = () => {
    router.push("/pools");
  };

  const handleTopUpCard = (cardId: string) => {
    router.push(`/cards/topup?card=${cardId}`);
  };

  // Flow handlers
  const handleIssueCard = async () => {
    startIssuanceFlow();
  };

  const handleAnimationComplete = async () => {
    // Issue the actual card
    const newCard = await issueNewCard();
    setCurrentCard(newCard);

    // Complete the animation flow
    completeAnimation();
  };

  const handleTopUp = () => {
    if (currentCard) {
      handleTopUpCard(currentCard.id);
    }
  };

  const handleIssueAnother = () => {
    setCurrentCard(null);
    resetToInitial();
  };

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <LabelHeader
          backText="← Back"
          onBack={() => router.push("/pools")}
          label="Card Issuance"
        />

        {/* Main content based on flow state */}
        <AnimatePresence mode="wait">
          {isInInitialState && (
            <InitialState
              key="initial"
              onIssueCard={handleIssueCard}
              isIssuing={isIssuing}
              issuedCards={issuedCards}
              onTopUpCard={handleTopUpCard}
            />
          )}

          {isSuccess && currentCard && (
            <SuccessState
              key="success"
              card={currentCard}
              onTopUp={handleTopUp}
              onIssueAnother={handleIssueAnother}
            />
          )}
        </AnimatePresence>

        {/* Printing animation overlay */}
        <AnimatePresence>
          <CardPrintingAnimation
            isVisible={showPrintingAnimation}
            onComplete={handleAnimationComplete}
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Initial state component - card issuance entry point
 */
interface InitialStateProps {
  onIssueCard: () => void;
  isIssuing: boolean;
  issuedCards: IssuedCard[];
  onTopUpCard: (cardId: string) => void;
}

const InitialState: React.FC<InitialStateProps> = ({
  onIssueCard,
  isIssuing,
  issuedCards,
  onTopUpCard,
}) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    transition={{ duration: 0.5 }}
  >
    {/* Hero section */}
    <HeroSection onIssueCard={onIssueCard} isIssuing={isIssuing} />

    {/* Existing cards section */}
    {issuedCards.length > 0 && (
      <ExistingCardsSection cards={issuedCards} onTopUpCard={onTopUpCard} />
    )}
  </motion.div>
);

/**
 * Hero section with main call-to-action
 */
interface HeroSectionProps {
  onIssueCard: () => void;
  isIssuing: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onIssueCard,
  isIssuing,
}) => (
  <>
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
      Issue a new prepaid gas card instantly. No network calls required - your
      card is generated locally with a unique secure ID.
    </motion.p>

    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
    >
      <button
        onClick={onIssueCard}
        disabled={isIssuing}
        className="btn-prepaid-primary btn-lg"
      >
        {isIssuing ? "Issuing Card..." : "Issue New Card ✨"}
      </button>
      <p className="text-xs text-slate-400 mt-3">
        Instant issuance • No network required • Secure local generation
      </p>
    </motion.div>
  </>
);

/**
 * Existing cards section
 */
interface ExistingCardsSectionProps {
  cards: IssuedCard[];
  onTopUpCard: (cardId: string) => void;
}

const ExistingCardsSection: React.FC<ExistingCardsSectionProps> = ({
  cards,
  onTopUpCard,
}) => (
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
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
        >
          <CompactInactiveCard
            card={card}
            onTopUp={() => onTopUpCard(card.id)}
          />
        </motion.div>
      ))}
    </div>
  </motion.div>
);

/**
 * Success state component
 */
interface SuccessStateProps {
  card: IssuedCard;
  onTopUp: () => void;
  onIssueAnother: () => void;
}

const SuccessState: React.FC<SuccessStateProps> = ({
  card,
  onTopUp,
  onIssueAnother,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    transition={{ duration: 0.5 }}
  >
    <CardSuccessDisplay
      card={card}
      onTopUp={onTopUp}
      onIssueAnother={onIssueAnother}
    />
  </motion.div>
);

export default CardIssuanceFlow;
