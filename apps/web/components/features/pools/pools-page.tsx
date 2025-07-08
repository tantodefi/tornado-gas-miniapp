//file:prepaid-gas-website/apps/web/components/features/pools/pools-page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePoolsData } from "@/hooks/pools/use-pools-data";
import { usePoolsFilter } from "@/hooks/pools/use-pools-filter";
import { useApiError } from "@/hooks/shared/use-api-error";
import PrepaidPoolCard from "./multi-use-pool-card";
import FilterBar from "./pool-filters";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PoolsPageHeader } from "@/components/layout/page-header";

// Card Skeleton Loader Component (unchanged)
const CardSkeleton: React.FC = () => (
  <div className="w-[250px] h-[150px] sm:w-[280px] sm:h-[168px] lg:w-[320px] lg:h-[192px] mx-auto bg-slate-800/50 rounded-xl lg:rounded-2xl border border-slate-600/30 relative animate-pulse">
    <div className="p-4 sm:p-5 lg:p-6 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="flex flex-col items-start space-y-2">
          <div className="w-12 h-3 bg-slate-600/50 rounded"></div>
          <div className="w-16 h-2 bg-slate-600/50 rounded"></div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="w-16 h-4 bg-slate-600/50 rounded"></div>
          <div className="w-12 h-2 bg-slate-600/50 rounded"></div>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="w-20 h-2 bg-slate-600/50 rounded"></div>
        <div className="w-14 h-2 bg-slate-600/50 rounded"></div>
      </div>
    </div>
  </div>
);

/**
 * Prepaid Pools Page Component - UPDATED with navigation links
 * Single responsibility: Present pools data with filtering UI
 * Uses Next.js useRouter for navigation
 */
const PrepaidPoolsPage = () => {
  const router = useRouter();

  // Data fetching (pure data concern)
  const { pools, isLoading, error, lastFetchTime, refetch } = usePoolsData();

  // Business logic (filtering and sorting)
  const { filteredPools, filters, setFilter, resetFilters, poolCount } =
    usePoolsFilter(pools);

  // Error handling (standardized error management)
  const { displayError, retry, isRetrying } = useApiError(error, refetch);

  // Navigation handlers using Next.js router
  const handleCardClick = (poolId: string) => {
    router.push(`/pools/${poolId}`);
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleRetry = () => {
    if (isRetrying) return;
    retry();
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* UPDATED Header with Navigation */}
        <PoolsPageHeader />

        {/* Filter Bar (unchanged) */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilter}
          poolCount={poolCount}
          isLoading={isLoading}
        />

        {/* Error State (unchanged) */}
        {displayError && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Error Loading Pools
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {displayError}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="btn-prepaid-primary btn-md"
                disabled={isRetrying}
              >
                {isRetrying ? "Retrying..." : "Try Again"}
              </button>
              <button
                onClick={handleBackToHome}
                className="btn-prepaid-outline btn-md"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State (unchanged) */}
        {isLoading && !displayError && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CardSkeleton />
              </motion.div>
            ))}
          </div>
        )}

        {/* Cards Grid (unchanged) */}
        {!isLoading && !displayError && filteredPools.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
            {filteredPools.map((pool, index) => (
              <motion.div
                key={pool.poolId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PrepaidPoolCard pool={pool} onCardClick={handleCardClick} />
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results State (unchanged) */}
        {!isLoading &&
          !displayError &&
          filteredPools.length === 0 &&
          pools.length > 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Pools Found
              </h3>
              <p className="text-slate-400 mb-6">
                Try adjusting your filters to see more results
              </p>
              <button
                onClick={handleResetFilters}
                className="btn-prepaid-outline btn-md"
              >
                Reset Filters
              </button>
            </motion.div>
          )}

        {/* Footer Info (unchanged) */}
        {!isLoading && !displayError && filteredPools.length > 0 && (
          <div className="text-center mt-16 text-slate-400 text-sm">
            <p>🔒 All transactions are private and unlinkable</p>
            {lastFetchTime && (
              <p className="mt-2 text-xs">
                Data refreshed at {new Date(lastFetchTime).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrepaidPoolsPage;
