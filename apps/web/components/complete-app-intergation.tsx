// components/complete-app-integration.tsx
"use client";

import React, { useState } from "react";
import PrepaidPoolsPage from "@/components/prepaid-pools-page";
import PoolDetailsPage from "@/components/pool-details-page";
import CardIssuanceFlow from "@/components/card-issuance-flow";
import { type IssuedCard } from "@/hooks/use-card-issuance";

// Navigation state types
type ViewType = "cards" | "details" | "issuance" | "topup";

interface NavigationState {
  view: ViewType;
  selectedPoolId?: string;
  selectedCardId?: string;
}

/**
 * Complete app integration component
 * Manages navigation between all major flows:
 * - Cards list view
 * - Card details view
 * - Card issuance flow
 * - Top-up flow (future)
 */
const CompleteAppIntegration: React.FC = () => {
  const [navigation, setNavigation] = useState<NavigationState>({
    view: "cards",
  });

  // Navigation handlers
  const handleViewCardDetails = (poolId: string) => {
    setNavigation({
      view: "details",
      selectedPoolId: poolId,
    });
  };

  const handleBackToCards = () => {
    setNavigation({
      view: "cards",
      selectedPoolId: undefined,
      selectedCardId: undefined,
    });
  };

  const handleNavigateToIssuance = () => {
    setNavigation({
      view: "issuance",
    });
  };

  const handleNavigateToTopUp = (cardId?: string) => {
    setNavigation({
      view: "topup",
      selectedCardId: cardId,
    });
  };

  // Card issuance handlers
  const handleCardIssued = (card: IssuedCard) => {
    console.log("New card issued:", card);
    // Card is automatically stored by the hook
    // Could show a toast notification here
  };

  // Pool joining handler (starts top-up flow)
  const handleJoinPool = (poolId: string) => {
    console.log(`Starting top-up flow for pool: ${poolId}`);
    // Future: This will trigger wallet connection and transaction flow
    // For now, navigate to top-up flow
    handleNavigateToTopUp();
  };

  // Top-up handler for issued cards
  const handleTopUpCard = (cardId: string) => {
    console.log(`Starting top-up flow for card: ${cardId}`);
    handleNavigateToTopUp(cardId);
  };

  // Render views based on navigation state
  const renderCurrentView = () => {
    switch (navigation.view) {
      case "details":
        if (!navigation.selectedPoolId) {
          // Fallback to cards view if no pool selected
          setNavigation({ view: "cards" });
          return null;
        }
        return (
          <PoolDetailsPage
            poolId={navigation.selectedPoolId}
            onBack={handleBackToCards}
            onJoinPool={handleJoinPool}
          />
        );

      case "issuance":
        return (
          <CardIssuanceFlow
            onCardIssued={handleCardIssued}
            onTopUpCard={handleTopUpCard}
            onBack={handleBackToCards}
          />
        );

      case "topup":
        // Future: Top-up flow component
        return (
          <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={handleBackToCards}
                  className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono"
                >
                  ← Back to Cards
                </button>
                <div className="text-xs text-slate-500 font-mono">
                  Top-up Flow
                </div>
              </div>

              <div className="text-center">
                <div className="text-6xl mb-6">🚀</div>
                <h1 className="heading-prepaid-section mb-4">
                  <span className="text-prepaid-gradient-white">Top-up </span>
                  <span className="text-prepaid-gradient-brand">Flow</span>
                </h1>
                <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                  This is where the wallet connection and Ethereum transaction
                  flow will be implemented.
                  {navigation.selectedCardId && (
                    <>
                      <br />
                      Selected card:{" "}
                      <span className="text-purple-400 font-mono">
                        {navigation.selectedCardId}
                      </span>
                    </>
                  )}
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleBackToCards}
                    className="btn-prepaid-outline btn-lg"
                  >
                    Back to Cards
                  </button>
                  <button
                    onClick={() => {
                      // Future: Trigger wallet connection
                      alert(
                        "Wallet connection flow will be implemented in Option 3!",
                      );
                    }}
                    className="btn-prepaid-primary btn-lg"
                  >
                    Connect Wallet →
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "cards":
      default:
        return (
          <PrepaidPoolsPage
            onCardClick={handleViewCardDetails}
            onViewDetails={handleViewCardDetails}
          />
        );
    }
  };

  return (
    <div className="relative">
      {/* Floating Action Button for Card Issuance */}
      {navigation.view === "cards" && (
        <button
          onClick={handleNavigateToIssuance}
          className="fixed bottom-6 right-6 z-50 btn-prepaid-primary btn-lg rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
          style={{
            minHeight: "56px",
            minWidth: "56px",
            borderRadius: "50%",
            padding: "0 1.5rem",
          }}
          title="Issue New Card"
        >
          ✨ Get Card
        </button>
      )}

      {/* Current view */}
      {renderCurrentView()}
    </div>
  );
};

export default CompleteAppIntegration;
