//file: components/features/pools/pool-details-page.tsx (SIMPLIFIED)
"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePoolDetails } from "@/hooks/pools/use-pool-details";
import { usePoolJoinFlow } from "@/hooks/pools/use-pool-join-flow";
import LoadingSkeleton from "@/components/shared/loading-skeleton";
import ErrorState from "@/components/shared/error-state";
import { PoolPageHeader } from "@/components/layout/page-header";
import EnhancedPoolCard from "./enhanced-pool-card";
import PoolOverview from "./pool-overview";
import PoolActivitySection from "./pool-activity-section";
import PaymentModal from "../payment/payment-modal";
import CardReceipt from "../cards/card-receipt";
import { PaymentData } from "@/types";
import { toast } from "sonner";
interface PoolDetailsPageProps {
  poolId: string;
}

/**
 * PoolDetailsPage Component
 */
const PoolDetailsPage: React.FC<PoolDetailsPageProps> = ({ poolId }) => {
  const router = useRouter();

  // Pool data fetching
  const { pool, isLoading, error: poolError, refetch } = usePoolDetails(poolId);

  const {
    state,
    isJoining,
    showPayment,
    showSuccess,
    canCancel,
    generatedCard,
    activatedCard,
    error,
    paymentPool,
    startJoin,
    setPaymentInProgress,
    handlePaymentSuccess,
    handlePaymentError,
    handlePaymentCancel,
    handleSuccessComplete,
  } = usePoolJoinFlow(pool);

  // Handle errors with simple alerts
  useEffect(() => {
    if (error) {
      toast(error);
    }
  }, [error]);

  // Navigation
  const handleBack = () => router.push("/pools");

  // Enhanced payment handlers that work with PaymentModal
  const handlePaymentStarted = (paymentData: PaymentData) => {
    console.log("🔐 Wallet confirmation started - disabling cancel button");
    setPaymentInProgress(); // Disable cancel button when wallet dialog appears
  };

  const enhancedPaymentSuccess = (card: any, details: any) => {
    handlePaymentSuccess(details); // Pass only details, card is managed internally
  };

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

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <PoolPageHeader
          backText="← Back to Pools"
          onBack={handleBack}
          label={`Pool Details • ${state}`}
        />

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
              {/* Enhanced Pool Card */}
              <div className="mb-6">
                <EnhancedPoolCard
                  pool={pool}
                  onJoin={startJoin}
                  isJoining={isJoining}
                  showPayment={showPayment}
                />
              </div>

              {/* Pool Overview */}
              <PoolOverview pool={pool} />
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
              <div className="card-prepaid-glass card-content-lg h-full overflow-y-auto pr-2">
                <PoolActivitySection pool={pool} isLoading={isLoading} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment Modal - Enhanced with payment progress tracking */}
      {showPayment && paymentPool && generatedCard && (
        <PaymentModal
          isVisible={showPayment}
          paymentPool={paymentPool}
          generatedCard={generatedCard}
          poolId={poolId}
          onPaymentSuccess={enhancedPaymentSuccess}
          onPaymentError={handlePaymentError}
          onCancel={canCancel ? handlePaymentCancel : undefined}
          onPaymentStarted={handlePaymentStarted}
        />
      )}

      {/* Success Screen */}
      {showSuccess && activatedCard && (
        <CardReceipt
          card={activatedCard}
          showRecoveryPhrase={true}
          onClose={handleSuccessComplete}
        />
      )}
    </div>
  );
};

export default PoolDetailsPage;
