//file:prepaid-gas-website/apps/web/components/features/pools/pool-details-page.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { GenerateIdentityResult, PaymentPool, PoolCard } from "@/types";
import { usePoolDetails } from "@/hooks/pools/use-pool-details";
import {
  generateCompleteIdentity,
  IdentitySecurity,
} from "@/lib/identity/generator";
import { saveCardToIndexedDB } from "@/lib/storage/indexed-db";
import { encodePaymasterContext } from "@workspace/core";
import LoadingSkeleton from "@/components/shared/loading-skeleton";
import ErrorState from "@/components/shared/error-state";
import { LabelHeader } from "@/components/layout/page-header";
import EnhancedPoolCard from "./enhanced-pool-card";
import PoolOverview from "./pool-overview";
import MembersSection from "./members-section";
import PoolActivitySection from "./pool-activity-section";
import PaymentModal from "../payment/payment-modal";
import SecureSuccessScreen from "../identity/secure-success-screen";

interface PoolDetailsPageProps {
  poolId: string;
}

/**
 * PoolDetailsPage Component
 *
 * Single Responsibility: Orchestrate pool details display and joining flow
 *
 * Features:
 * - Pool data fetching and display
 * - Identity generation and card creation
 * - Payment flow management
 * - Success screen with recovery phrase
 * - Error and loading state handling
 */
const PoolDetailsPage: React.FC<PoolDetailsPageProps> = ({ poolId }) => {
  const router = useRouter();

  // Member display state
  const [showMembers, setShowMembers] = useState(false);
  const [memberLimit, setMemberLimit] = useState(100);

  // Join flow state
  const [isJoining, setIsJoining] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Generated data state
  const [generatedCard, setGeneratedCard] = useState<PoolCard | null>(null);
  const [generatedIdentity, setGeneratedIdentity] =
    useState<GenerateIdentityResult | null>(null);
  const [activatedCard, setActivatedCard] = useState<PoolCard | null>(null);

  // Pool data hook
  const { pool, isLoading, error, refetch, members } = usePoolDetails(poolId);

  // Navigation handlers
  const handleBack = () => {
    router.push("/pools");
  };

  // Join pool flow
  const handleJoinPool = async () => {
    if (!pool) return;

    try {
      setIsJoining(true);

      // Validate secure environment
      IdentitySecurity.validateSecureContext();

      // Generate identity automatically
      const identity = generateCompleteIdentity();
      setGeneratedIdentity(identity);

      // Generate encoded paymaster context using the new function
      const paymasterContext = encodePaymasterContext(
        pool.paymaster.address as `0x${string}`, // paymaster address
        pool.poolId, // pool ID
        identity.identity.export(), // identity string
      );

      console.log("Generated paymaster context:", paymasterContext);

      // Create the card but don't save to IndexedDB yet (wait for payment success)
      const newCard: PoolCard = {
        id: identity.cardId,
        poolId: pool.poolId,
        poolDetails: {
          joiningFee: pool.joiningFee,
          memberCount: pool.memberCount, // Updated from membersCount
          network: pool.network,
        },
        identity: {
          mnemonic: identity.mnemonic,
          privateKey: identity.privateKey,
          commitment: identity.commitment,
        },
        paymasterContract: pool.paymaster.address,
        paymasterContext: paymasterContext,
        createdAt: new Date().toISOString(),
        status: "pending-topup",
        expiresAt: identity.expiresAt,
      };

      setGeneratedCard(newCard);

      // Show payment component instead of redirecting
      setShowPayment(true);
    } catch (error) {
      console.error("Failed to create identity:", error);
      alert("Failed to create gas card. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  // Member section handlers
  const handleToggleMembers = () => {
    setShowMembers(!showMembers);
  };

  // Payment handlers
  const handlePaymentSuccess = async (activatedCard: PoolCard) => {
    console.log("Payment successful, card activated:", activatedCard.id);
    // Save the activated card to IndexedDB
    await saveCardToIndexedDB(activatedCard);
    // Store activated card and show success screen
    setActivatedCard(activatedCard);
    setShowPayment(false);
    setShowSuccessScreen(true);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment failed:", error);
    setShowPayment(false);
    alert(`Payment failed: ${error}`); // Temporary error handling
  };

  const handleCancelPayment = () => {
    setShowPayment(false);
    setGeneratedCard(null);
    setGeneratedIdentity(null);
  };

  // Success screen handlers
  const handleSuccessComplete = () => {
    setShowSuccessScreen(false);
    setGeneratedCard(null);
    setGeneratedIdentity(null);
    setActivatedCard(null);
    // Navigate to cards dashboard or pools
    router.push("/cards/pending");
  };

  // Convert pool to PaymentPool format
  const paymentPool: PaymentPool | null = pool;

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton onBack={handleBack} />;
  }

  // Error state
  if (error || !pool) {
    return <ErrorState error={error} onBack={handleBack} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <LabelHeader
          backText="← Back to Pools"
          onBack={handleBack}
          label="Pool Details"
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column - Pool Card & Overview */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-8"
            >
              {/* Enhanced Pool Card */}
              <div className="mb-6">
                <EnhancedPoolCard
                  pool={pool}
                  onJoin={handleJoinPool}
                  isJoining={isJoining}
                  showPayment={showPayment}
                />
              </div>

              {/* Pool Overview */}
              <PoolOverview pool={pool} />
            </motion.div>
          </div>

          {/* Right Column - Technical Details & Members */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Members Section */}
              <MembersSection
                pool={pool}
                members={members}
                showMembers={showMembers}
                memberLimit={memberLimit}
                isLoading={isLoading}
                onToggleMembers={handleToggleMembers}
                onMemberLimitChange={setMemberLimit}
              />

              {/* Pool Activity */}
              <PoolActivitySection />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && paymentPool && generatedCard && (
        <PaymentModal
          isVisible={showPayment}
          paymentPool={paymentPool}
          generatedCard={generatedCard}
          poolId={poolId}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          onCancel={handleCancelPayment}
        />
      )}

      {/* Success Screen Modal */}
      {showSuccessScreen && activatedCard && generatedIdentity && (
        <SecureSuccessScreen
          card={activatedCard}
          identity={generatedIdentity}
          pool={pool}
          onComplete={handleSuccessComplete}
        />
      )}
    </div>
  );
};

export default PoolDetailsPage;
