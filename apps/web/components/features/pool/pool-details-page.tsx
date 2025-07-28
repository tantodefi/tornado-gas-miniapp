//file: prepaid-gas-website/apps/web/components/features/pool/pool-details-page.tsx

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "@workspace/ui/components/sonner";
import { usePoolDetails } from "@/hooks/pools/use-pool-details";
import usePoolJoinFlow from "@/hooks/pools/use-pool-join-flow";
import { AppHeader } from "@/components/layout/app-header";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Button } from "@workspace/ui/components/button";
import { PaymentProviderWrapper } from "@/components/providers/payment-provider-wrapper";
import LoadingSkeleton from "@/components/features/pool/pool-page-loading-skeleton";
import ErrorState from "@/components/features/pool/pool-page-error-state";
import JoinPoolSection from "./join-pool-section";
import PoolOverviewSection from "./pool-overview-section";
import PoolActivitySection from "./pool-activity-section";
import { PaymentModal } from "../payment/payment-modal";
import CardReceipt from "../cards/card-receipt";
import type { Pool } from "@/types/pool";

interface PoolDetailsPageProps {
  paymasterAddress: string;
  initialData?: Pool;
}

/**
 * Pool Details Page Component
 */
function PoolDetailsPage({
  paymasterAddress,
  initialData,
}: PoolDetailsPageProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pool data fetching with optional initial data
  const {
    pool,
    isLoading,
    error: poolError,
    refetch,
  } = usePoolDetails(paymasterAddress, initialData);

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

  // Show toast notifications for join errors
  React.useEffect(() => {
    if (joinError) {
      toast.error(joinError, {
        duration: 5000,
        description:
          "Please try again or contact support if the issue persists",
      });
    }
  }, [joinError]);

  // Navigation handlers
  const handleBack = () => router.push("/pools");

  // Refresh handler
  const handleRefresh = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      await refetch();
      toast.success("Pool data refreshed");
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Failed to refresh pool data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Pools", href: "/pools" },
    {
      label:
        pool?.contractType || "Unknown Pool Type",
      isCurrentPage: false,
    },
    { label: `${paymasterAddress}`, isCurrentPage: true },
  ];

  // Loading state (only shows if no initial data)
  if (isLoading) {
    return (
      <PaymentProviderWrapper>
        <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
          <AppHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PageBreadcrumb items={breadcrumbItems} className="mb-8" />
            <LoadingSkeleton />
          </div>
        </div>
      </PaymentProviderWrapper>
    );
  }

  // Error state
  if (poolError || !pool) {
    return (
      <PaymentProviderWrapper>
        <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
          <AppHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PageBreadcrumb items={breadcrumbItems} className="mb-8" />
            <ErrorState
              error={poolError}
              onBack={handleBack}
              onRetry={refetch}
            />
          </div>
        </div>
      </PaymentProviderWrapper>
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
    <PaymentProviderWrapper>
      <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
        {/* App Header */}
        <AppHeader />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb and Refresh Section */}
          <div className="flex justify-between items-center mb-8">
            {/* Left side - Breadcrumb */}
            <PageBreadcrumb items={breadcrumbItems} />

            {/* Right side - Refresh button */}
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-purple-400 hover:bg-purple-400/10 transition-colors font-mono"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

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
    </PaymentProviderWrapper>
  );
}

export default PoolDetailsPage;
