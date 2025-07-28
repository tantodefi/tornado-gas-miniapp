//file: apps/web/hooks/pools/use-pool-details.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { prepaidPoolsApi } from "@/lib/api/api-client";
import type { Pool } from "@/types/pool";
import { ApiError } from "@/lib/api/type";

// Add initialData parameter to the hook
export const usePoolDetails = (
  paymasterAddress: string,
  initialData?: Pool,
) => {
  const [pool, setPool] = useState<Pool | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Add request deduplication
  const isRequestInProgress = useRef(false);
  const currentRequest = useRef<string | null>(null);

  const loadPoolDetails = useCallback(async () => {
    const requestKey = `${paymasterAddress}`;

    // Prevent duplicate requests
    if (isRequestInProgress.current && currentRequest.current === requestKey) {
      console.log(
        `🔄 Request for pool ${paymasterAddress} already in progress, skipping...`,
      );
      return;
    }

    try {
      isRequestInProgress.current = true;
      currentRequest.current = requestKey;
      setIsLoading(true);
      setError(null);

      const response = await prepaidPoolsApi.getPoolDetails(paymasterAddress);

      if (!response.success || !response.data) {
        throw new Error(`Pool ${paymasterAddress} not found`);
      }

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
            errorMessage = `Pool ${paymasterAddress} not found. It may have been removed or the ID is incorrect.`;
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

      console.error(`❌ Error loading pool ${paymasterAddress}:`, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isRequestInProgress.current = false;
    }
  }, [paymasterAddress]);

  // Only load if we don't have initial data
  useEffect(() => {
    if (paymasterAddress && !initialData) {
      currentRequest.current = null; // Reset to allow new request
      loadPoolDetails();
    }
  }, [paymasterAddress, loadPoolDetails, initialData]);

  // Refetch function for retry functionality
  const refetch = useCallback(() => {
    loadPoolDetails();
  }, [loadPoolDetails]);

  // Helper functions for working with BigInt strings
  const getJoiningFeeAsNumber = useCallback(() => {
    return pool ? parseInt(pool.joiningAmount) : 0;
  }, [pool]);

  const getMembersCountAsNumber = useCallback(() => {
    return pool ? parseInt(pool.treeSize) : 0;
  }, [pool]);

  const getTotalDepositsAsNumber = useCallback(() => {
    return pool ? parseInt(pool.totalDeposit) : 0;
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
    // members: pool?.members || [],
    // hasMembers: (pool?.members?.length || 0) > 0,
    // memberCount: pool?.members?.length || 0,
    // Direct access to activity
    // activity: pool?.activity || [],
    // hasActivity: (pool?.activity?.length || 0) > 0,
    // activityCount: pool?.activity?.length || 0,
  };
};
