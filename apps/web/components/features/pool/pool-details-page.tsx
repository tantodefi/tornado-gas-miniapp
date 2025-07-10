//file:prepaid-gas-website/apps/web/components/features/pools/pool-details-page.tsx

"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePoolDetails } from "@/hooks/pools/use-pool-details";
import usePoolJoinFlow from "@/hooks/pools/use-pool-join-flow";
import { PoolPageHeader } from "@/components/layout/page-header";
import LoadingSkeleton from "@/components/features/pool/pool-page-loading-skeleton";
import ErrorState from "@/components/features/pool/pool-page-error-state";
import JoinPoolSection from "./join-pool-section";
import PoolOverviewSection from "./pool-overview-section";
import PoolActivitySection from "./pool-activity-section";
import { PaymentModal } from "../payment/payment-modal";
import CardReceipt from "../cards/card-receipt";

interface PoolDetailsPageProps {
  poolId: string;
}

/**
 * Pool Details Page Component
 * Single responsibility: Orchestrate pool details view and join flow
 */
function PoolDetailsPage({ poolId }: PoolDetailsPageProps) {
  const router = useRouter();

  // Pool data fetching
  const { pool, isLoading, error: poolError, refetch } = usePoolDetails(poolId);

  // Join flow state management
  const {
    state,
    generatedCard,
    completedCard,
    error: joinError,
    canCancel,
    showPaymentModal,
    showSuccessModal,
    startJoinFlow,
    onPaymentStarted,
    onPaymentSuccess,
    onPaymentError,
    onPaymentCancelled,
    onSuccessComplete,
  } = usePoolJoinFlow(pool);

  // Navigation
  const handleBack = () => router.push("/pools");

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton onBack={handleBack} />;
  }

  // Error state
  if (poolError || !pool) {
    return (
      <ErrorState error={poolError} onBack={handleBack} onRetry={refetch} />
    );
  }

  // Handle join button click
  const handleJoinClick = () => {
    console.log({ state });
    if (state === "idle" || state === "error") {
      startJoinFlow();
    }
  };

  // Get button state for join section
  const getJoinButtonState = () => {
    switch (state) {
      case "preparing":
        return { text: "Preparing...", disabled: true };
      case "ready-for-payment":
      case "payment-in-progress":
        return { text: "Payment in progress...", disabled: true };
      case "error":
        return { text: "Try Again", disabled: false };
      default:
        return { text: "Join Pool", disabled: false };
    }
  };

  const joinButtonState = getJoinButtonState();

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <PoolPageHeader
          backText="← Back to Pools"
          onBack={handleBack}
          label="Pool Details"
        />

        {/* Error Display */}
        {joinError && (
          <motion.div
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-red-400 text-sm">{joinError}</p>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 h-[calc(100vh-20rem)]">
          {/* Left Column - Pool Card & Overview */}
          <div className="lg:col-span-5 h-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="h-full flex flex-col justify-start"
            >
              <div className="mb-6">
                <JoinPoolSection
                  pool={pool}
                  onJoin={handleJoinClick}
                  buttonText={joinButtonState.text}
                  buttonDisabled={joinButtonState.disabled}
                />
              </div>

              <PoolOverviewSection pool={pool} />
            </motion.div>
          </div>

          {/* Right Column - Pool Activity */}
          <div className="lg:col-span-7 h-full overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-full"
            >
              <div className="card-prepaid-glass card-content-lg h-full overflow-y-auto py-6 pr-4 scrollbar-thin">
                <PoolActivitySection pool={pool} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && generatedCard && (
        <PaymentModal
          isVisible={showPaymentModal}
          pool={pool}
          card={generatedCard}
          canCancel={canCancel}
          onPaymentStarted={onPaymentStarted}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          onCancel={canCancel ? onPaymentCancelled : undefined}
        />
      )}

      {/* Success Screen */}
      {showSuccessModal && completedCard && (
        <CardReceipt
          card={completedCard}
          showRecoveryPhrase={true}
          onClose={onSuccessComplete}
        />
      )}
    </div>
  );
}

export default PoolDetailsPage;
