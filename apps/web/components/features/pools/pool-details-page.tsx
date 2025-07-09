//file:prepaid-gas-website/apps/web/components/features/pools/pool-details-page.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PaymentDetails, PaymentPool, PoolCard } from "@/types";
import { usePoolDetails } from "@/hooks/pools/use-pool-details";
import {
  generateCompleteIdentity,
  IdentitySecurity,
} from "@/lib/identity/generator";
import { saveCardToIndexedDB, updateCardInIndexedDB } from "@/lib/storage/indexed-db";
import { encodePaymasterContext } from "@workspace/core";
import LoadingSkeleton from "@/components/shared/loading-skeleton";
import ErrorState from "@/components/shared/error-state";
import { PoolPageHeader } from "@/components/layout/page-header";
import EnhancedPoolCard from "./enhanced-pool-card";
import PoolOverview from "./pool-overview";
import PoolActivitySection from "./pool-activity-section";
import PaymentModal from "../payment/payment-modal";
import CardReceipt from "../cards/card-receipt";

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

  // Join flow state
  const [isJoining, setIsJoining] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Generated data state
  const [generatedCard, setGeneratedCard] = useState<PoolCard | null>(null);
  const [activatedCard, setActivatedCard] = useState<PoolCard | null>(null);

  const { pool, isLoading, error, refetch } = usePoolDetails(poolId);

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

      // Generate encoded paymaster context
      const paymasterContext = encodePaymasterContext(
        pool.paymaster.address as `0x${string}`, // paymaster address
        pool.poolId, // pool ID
        identity.identity.export(), // identity string
      );

      // Create the card with new structure - UPDATED
      const newCard: PoolCard = {
        id: crypto.randomUUID(),
        poolInfo: {
          poolId: pool.poolId,
          joiningFee: pool.joiningFee,
          network: pool.network,
          paymasterType: pool.paymaster.contractType,
        },
        identity: {
          mnemonic: identity.mnemonic,
          privateKey: identity.privateKey,
          commitment: identity.commitment,
        },
        paymasterContract: pool.paymaster.address,
        paymasterContext,
        // Transaction data will be filled after payment
        transactionHash: "", // Will be updated after payment
        chainId: "", // Will be updated after payment
        purchasedAt: new Date().toISOString(),
        expiresAt: identity.expiresAt,
        status: "active",
        balance: "0", // Will be updated after payment
      };

      // Save card to IndexedDB (will be updated after payment)
      await saveCardToIndexedDB(newCard);
      setGeneratedCard(newCard);

      console.log("✅ Card created and saved:", newCard.id);

      // Show payment modal
      setShowPayment(true);
    } catch (error) {
      console.error("Failed to join pool:", error);
      alert(
        error instanceof Error
          ? `Failed to join pool: ${error.message}`
          : "Failed to join pool. Please try again.",
      );
    } finally {
      setIsJoining(false);
    }
  };

  // Payment handlers
  const handlePaymentSuccess = async (activatedCard: PoolCard, details: PaymentDetails) => {
    console.log("✅ Payment successful:", {
      cardId: activatedCard.id,
      transactionHash: details.transactionHash,
      network: details.network,
    });
  
    try {
      // 🔧 FIX: Update the card in IndexedDB with transaction details
      const updatedCard = await updateCardInIndexedDB(activatedCard.id, {
        transactionHash: details.transactionHash,
        chainId: details.network.chainId,
        blockNumber: details.blockNumber,
        gasUsed: details.gasUsed,
        balance: (parseFloat(details.pool.joiningFee) / 1e18).toString(),
        status: "active" as const,
        purchasedAt: new Date().toISOString(),
      });
  
      if (updatedCard) {
        console.log("✅ Card updated in IndexedDB:", {
          cardId: updatedCard.id,
          transactionHash: updatedCard.transactionHash,
          chainId: updatedCard.chainId,
        });
        setActivatedCard(updatedCard);
      } else {
        console.error("❌ Failed to update card in IndexedDB - card not found");
        // Create updated card for UI even if DB update failed
        const fallbackCard: PoolCard = {
          ...activatedCard,
          transactionHash: details.transactionHash,
          chainId: details.network.chainId,
          blockNumber: details.blockNumber,
          gasUsed: details.gasUsed,
          balance: (parseFloat(details.pool.joiningFee) / 1e18).toString(),
        };
        setActivatedCard(fallbackCard);
      }
  
      setShowPayment(false);
      setShowSuccessScreen(true);
    } catch (error) {
      console.error("❌ Failed to update card in IndexedDB:", error);
      
      // Still show success screen even if DB update fails
      const fallbackCard: PoolCard = {
        ...activatedCard,
        transactionHash: details.transactionHash,
        chainId: details.network.chainId,
        blockNumber: details.blockNumber,
        gasUsed: details.gasUsed,
        balance: (parseFloat(details.pool.joiningFee) / 1e18).toString(),
      };
      
      setActivatedCard(fallbackCard);
      setShowPayment(false);
      setShowSuccessScreen(true);
    }
  };

  
  const handlePaymentError = (error: string) => {
    console.error("❌ Payment failed:", error);
    alert(`Payment failed: ${error}`);
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleSuccessComplete = () => {
    setShowSuccessScreen(false);
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
        <PoolPageHeader
          backText="← Back to Pools"
          onBack={handleBack}
          label="Pool Details"
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
                  onJoin={handleJoinPool}
                  isJoining={isJoining}
                  showPayment={showPayment}
                />
              </div>

              {/* Pool Overview */}
              <PoolOverview pool={pool} />
            </motion.div>
          </div>

          {/* Right Column -   Pool Activity */}
          <div className="lg:col-span-7 h-full overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-full"
            >
              {/* Pool Activity */}
              <div className="card-prepaid-glass card-content-lg h-full overflow-y-auto pr-2">
                <PoolActivitySection pool={pool} isLoading={isLoading} />
              </div>
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
          onCancel={handlePaymentCancel}
        />
      )}

      {/* Success Screen  */}
      {showSuccessScreen && activatedCard && (
        <CardReceipt
        card={activatedCard}
        showRecoveryPhrase={true} // Show recovery phrase for new purchases
        onClose={handleSuccessComplete}
        />
      )}
    </div>
  );
};

export default PoolDetailsPage;
