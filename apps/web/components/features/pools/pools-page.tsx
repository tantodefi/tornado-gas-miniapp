// file: components/features/pools/pools-page.tsx
"use client";

import React, { useState } from "react";
import { usePoolsData } from "@/hooks/pools/use-pools-data";
import { usePoolsFilter } from "@/hooks/pools/use-pools-filter";
import { useApiError } from "@/hooks/shared/use-api-error";
import { AppHeader } from "@/components/layout/app-header";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Button } from "@workspace/ui/components/button";
import { RefreshCw } from "lucide-react";
import MultiUsePoolCard from "../../shared/multi-use-pool-card";
import OneTimeUsePoolCard from "../../shared/single-use-pool-card";
import FilterBar from "./pool-filters";
import { useRouter } from "next/navigation";
import type { Pool } from "@/types/pool";

interface PoolsPageProps {
  initialPools?: Pool[];
}

const PoolsPage: React.FC<PoolsPageProps> = ({ initialPools }) => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { pools, isLoading, error, lastFetchTime, refetch } =
    usePoolsData(initialPools);

  const { filteredPools, filters, setFilter, resetFilters, poolCount } =
    usePoolsFilter(pools);

  const { displayError, retry, isRetrying } = useApiError(error, refetch);

  const handleCardClick = ( paymasterAddress: string) =>
    router.push(`/pools/${paymasterAddress}`);
  const handleRetry = () => !isRetrying && retry();
  const handleResetFilters = () => resetFilters();

  // Refresh handler
  const handleRefresh = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      await refetch();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Pools", isCurrentPage: true },
  ];

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb and Refresh Section */}
        <div className="flex justify-between items-center mb-8">
          {/* Left side - Breadcrumb */}
          <PageBreadcrumb items={breadcrumbItems} />

          {/* Right side - Refresh button */}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
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

        <FilterBar
          filters={filters}
          onFilterChange={setFilter}
          poolCount={poolCount}
          isLoading={isLoading}
        />

        {displayError && (
          <div className="text-center py-12">
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
            </div>
          </div>
        )}

        {isLoading && !displayError && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="w-[320px] h-[192px] bg-slate-800/50 rounded-2xl border border-slate-600/30" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !displayError && filteredPools.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
            {filteredPools.map((pool) =>
              pool.contractType === "GasLimited" ? (
                <MultiUsePoolCard
                  key={`${pool.address}`}
                  pool={pool}
                  onCardClick={() =>
                    handleCardClick(pool.address)
                  }
                />
              ) : (
                <OneTimeUsePoolCard
                  key={`${pool.address}`}
                  pool={pool}
                  onCardClick={() =>
                    handleCardClick( pool.address)
                  }
                />
              ),
            )}
          </div>
        )}

        {!isLoading && !displayError && filteredPools.length === 0 && (
          <div className="text-center py-16">
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
          </div>
        )}

        {!isLoading && !displayError && filteredPools.length > 0 && (
          <div className="text-center mt-16 text-slate-400 text-sm">
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

export default PoolsPage;
