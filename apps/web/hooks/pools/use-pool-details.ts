//file:prepaid-gas-website/apps/web/hooks/pools/use-pool-details.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { prepaidPoolsApi } from "@/lib/api/api-client";
import type { Pool } from "@/types";
import { ApiError } from "@/lib/api/type";

// Custom hook for managing pool details state
export const usePoolDetails = (poolId: string) => {
  const [pool, setPool] = useState<Pool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add request deduplication
  const isRequestInProgress = useRef(false);
  const currentRequest = useRef<string | null>(null);

  const loadPoolDetails = useCallback(async () => {
    const requestKey = `${poolId}`;

    // Prevent duplicate requests
    if (isRequestInProgress.current && currentRequest.current === requestKey) {
      console.log(
        `🔄 Request for pool ${poolId} already in progress, skipping...`,
      );
      return;
    }

    try {
      isRequestInProgress.current = true;
      currentRequest.current = requestKey;
      setIsLoading(true);
      setError(null);

      console.log(`🔍 Loading pool details for ID: ${poolId}`);

      const response = await prepaidPoolsApi.getPoolDetails(poolId);

      if (!response.success || !response.data) {
        throw new Error(`Pool ${poolId} not found`);
      }

      console.log(`✅ Pool details loaded for ${poolId}`);
      setPool(response.data as Pool);
    } catch (err) {
      let errorMessage = "Failed to load pool details. Please try again.";

      if (err instanceof ApiError) {
        switch (err.code) {
          case "NETWORK_ERROR":
            errorMessage =
              "Unable to connect to server. Please check your internet connection.";
            break;
          case "NOT_FOUND":
            errorMessage = `Pool ${poolId} not found. It may have been removed or the ID is incorrect.`;
            break;
          case "REQUEST_TIMEOUT":
            errorMessage = "Request timed out. Please try again.";
            break;
          default:
            errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      console.error(`❌ Error loading pool ${poolId}:`, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isRequestInProgress.current = false;
    }
  }, [poolId]);

  // Load data when parameters change
  useEffect(() => {
    if (poolId) {
      currentRequest.current = null; // Reset to allow new request
      loadPoolDetails();
    }
  }, [poolId, loadPoolDetails]);

  // Refetch function for retry functionality
  const refetch = useCallback(() => {
    loadPoolDetails();
  }, [loadPoolDetails]);

  // ✅ Helper functions for working with BigInt strings
  // Updated to use new field names from data package
  const getJoiningFeeAsNumber = useCallback(() => {
    return pool ? parseInt(pool.joiningFee) : 0;
  }, [pool]);

  const getMembersCountAsNumber = useCallback(() => {
    return pool ? parseInt(pool.memberCount) : 0; // Updated from membersCount
  }, [pool]);

  const getTotalDepositsAsNumber = useCallback(() => {
    return pool ? parseInt(pool.totalDeposits) : 0;
  }, [pool]);

  return {
    pool,
    isLoading,
    error,
    refetch,
    // Helper functions
    getJoiningFeeAsNumber,
    getMembersCountAsNumber,
    getTotalDepositsAsNumber,
    // Direct access to members and metadata
    members: pool?.members || [],
    hasMembers: (pool?.members?.length || 0) > 0,
    memberCount: pool?.members?.length || 0,
  };
};
