// components/prepaid-cards-page.tsx (Updated with navigation props)
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { prepaidCardsApi, ApiError, type Pool } from "@/lib/api-client";
import PrepaidPoolCard from "./ui/prepaid-pool-card";
import FilterBar from "./ui/filter-bar";

interface FilterState {
  network: string;
  amountRange: string;
  memberRange: string;
  sortBy: string;
}

// Updated interface with navigation props
interface PrepaidCardsPageProps {
  onCardClick?: (poolId: string) => void;
  onViewDetails?: (poolId: string) => void;
}

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

// Main PrepaidCardsPage Component with navigation props
const PrepaidCardsPage: React.FC<PrepaidCardsPageProps> = ({
  onCardClick,
  onViewDetails,
}) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>({});
  const [lastFetchTime, setLastFetchTime] = useState<string>("");

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    network: "",
    amountRange: "",
    memberRange: "",
    sortBy: "newest",
  });

  // Fetch cards data with real API
  const loadCards = async (currentFilters: FilterState) => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        pools: cardsData,
        pagination: paginationData,
        meta,
      } = await prepaidCardsApi.getCards(currentFilters);

      setPools(cardsData);
      setPagination(paginationData);
      setLastFetchTime(meta.timestamp || new Date().toISOString());
    } catch (err) {
      let errorMessage = "Failed to load cards. Please try again.";

      if (err instanceof ApiError) {
        switch (err.code) {
          case "NETWORK_ERROR":
            errorMessage =
              "Unable to connect to server. Please check your internet connection.";
            break;
          case "HTTP_ERROR":
            errorMessage = `Server error (${err.status}). Please try again later.`;
            break;
          default:
            errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Error fetching cards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCards(filters);
  }, []);

  // Reload when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCards(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleBackToHome = () => {
    window.history.back();
  };

  const handleRetry = () => {
    loadCards(filters);
  };

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Back Button */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleBackToHome}
              className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono"
            >
              ← Back to Home
            </button>
            <div className="text-xs text-slate-500 font-mono">
              {lastFetchTime && (
                <span
                  title={`Last updated: ${new Date(lastFetchTime).toLocaleString()}`}
                >
                  v0.1 • {new Date(lastFetchTime).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <motion.h1
            className="heading-prepaid-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-prepaid-gradient-white">Prepaid Gas </span>
            <span className="text-prepaid-gradient-brand">Cards</span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Join anonymous gas credit pools.
            {onCardClick
              ? " Click any card to view details."
              : " Select card to purchase prepaid gas credits."}
          </motion.p>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          poolCount={pools.length}
          isLoading={isLoading}
        />

        {/* Error State */}
        {error && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Error Loading Cards
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="btn-prepaid-primary btn-md"
                disabled={isLoading}
              >
                {isLoading ? "Retrying..." : "Try Again"}
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

        {/* Loading State */}
        {isLoading && !error && (
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

        {/* Cards Grid */}
        {!isLoading && !error && pools.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
              {pools.map((pool, index) => (
                <motion.div
                  key={pool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PrepaidPoolCard
                    pool={pool}
                    onCardClick={onCardClick}
                    onViewDetails={onViewDetails}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination Info */}
            {pagination.total > 0 && (
              <div className="text-center mt-12 text-slate-400 text-sm">
                <p>
                  Showing {pools.length} of {pagination.total} cards
                  {pagination.totalPages > 1 && (
                    <span>
                      {" "}
                      • Page {pagination.page} of {pagination.totalPages}
                    </span>
                  )}
                </p>
              </div>
            )}
          </>
        )}

        {/* No Results State */}
        {!isLoading && !error && pools.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Cards Found
            </h3>
            <p className="text-slate-400 mb-6">
              {Object.values(filters).some((f) => f && f !== "newest")
                ? "Try adjusting your filters to see more results"
                : "No gas credit pools are currently available"}
            </p>
            <div className="flex gap-3 justify-center">
              {Object.values(filters).some((f) => f && f !== "newest") && (
                <button
                  onClick={() => {
                    setFilters({
                      network: "",
                      amountRange: "",
                      memberRange: "",
                      sortBy: "newest",
                    });
                  }}
                  className="btn-prepaid-outline btn-md"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={handleRetry}
                className="btn-prepaid-primary btn-md"
                disabled={isLoading}
              >
                Refresh
              </button>
            </div>
          </motion.div>
        )}

        {/* Footer Info */}
        {!isLoading && !error && pools.length > 0 && (
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

export default PrepaidCardsPage;
