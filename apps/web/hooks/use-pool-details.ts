import { useState, useEffect, useCallback, useRef } from "react";
import { prepaidPoolsApi, ApiError } from "@/lib/api-client";

/**
 * Pool details from our API (serialized format)
 */
interface DetailedPool {
  id: string;
  poolId: string;
  joiningFee: string; // String from API serialization
  merkleTreeDuration: string;
  totalDeposits: string;
  currentMerkleTreeRoot: string;
  membersCount: string;
  merkleTreeDepth: string;
  createdAt: string;
  createdAtBlock: string;
  currentRootIndex: number;
  rootHistoryCount: number;

  // Network metadata from API
  network: {
    name: string;
    chainId: number;
    chainName: string;
    networkName: string;
    contracts: {
      paymaster: string;
      verifier?: string;
    };
  };

  // Additional data from detailed endpoint
  members?: PoolMember[];
  rootHistory?: MerkleRootHistory[];
}

/**
 * Pool member from API
 */
interface PoolMember {
  id: string;
  identityCommitment: string;
  memberIndex: string;
  joinedAt: string;
  joinedAtBlock: string;
  isActive: boolean;
}

/**
 * Merkle root history from API
 */
interface MerkleRootHistory {
  id: string;
  index: number;
  merkleRoot: string;
  createdAt: string;
  createdAtBlock: string;
  isValid: boolean;
  transactionHash: string;
}

// Custom hook for managing pool details state
export const usePoolDetails = (poolId: string) => {
  const [pool, setPool] = useState<DetailedPool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add request deduplication
  const isRequestInProgress = useRef(false);
  const currentPoolId = useRef<string | null>(null);

  const loadPoolDetails = useCallback(async () => {
    // Prevent duplicate requests for the same pool
    if (isRequestInProgress.current && currentPoolId.current === poolId) {
      console.log(
        `🔄 Request for pool ${poolId} already in progress, skipping...`,
      );
      return;
    }

    try {
      isRequestInProgress.current = true;
      currentPoolId.current = poolId;
      setIsLoading(true);
      setError(null);

      console.log(`🔍 Loading pool details for ID: ${poolId}`);

      const response = await prepaidPoolsApi.getPoolDetails(poolId);

      if (!response.success || !response.data) {
        throw new Error(`Pool ${poolId} not found`);
      }

      console.log(`✅ Pool details loaded for ${poolId}`);
      setPool(response.data as DetailedPool);
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

  // Load data when poolId changes (only if different)
  useEffect(() => {
    if (poolId && poolId !== currentPoolId.current) {
      currentPoolId.current = null; // Reset to allow new request
      loadPoolDetails();
    }
  }, [poolId, loadPoolDetails]);

  // Refetch function for retry functionality
  const refetch = useCallback(() => {
    loadPoolDetails();
  }, [loadPoolDetails]);

  // ✅ Helper functions for working with BigInt strings
  const getJoiningFeeAsNumber = useCallback(() => {
    return pool ? parseInt(pool.joiningFee) : 0;
  }, [pool]);

  const getMembersCountAsNumber = useCallback(() => {
    return pool ? parseInt(pool.membersCount) : 0;
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
  };
};

export type { DetailedPool, PoolMember, MerkleRootHistory };
