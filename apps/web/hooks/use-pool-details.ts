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
export const usePoolDetails = (
  poolId: string,
  includeMembers: boolean = false,
  memberLimit: number = 100,
) => {
  const [pool, setPool] = useState<DetailedPool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add request deduplication
  const isRequestInProgress = useRef(false);
  const currentRequest = useRef<string | null>(null);

  const loadPoolDetails = useCallback(async () => {
    const requestKey = `${poolId}-${includeMembers}-${memberLimit}`;

    // Prevent duplicate requests
    if (isRequestInProgress.current && currentRequest.current === requestKey) {
      console.log(
        `🔄 Request for pool ${poolId} (members: ${includeMembers}) already in progress, skipping...`,
      );
      return;
    }

    try {
      isRequestInProgress.current = true;
      currentRequest.current = requestKey;
      setIsLoading(true);
      setError(null);

      console.log(
        `🔍 Loading pool details for ID: ${poolId}, includeMembers: ${includeMembers}`,
      );

      // Build query parameters
      const params: any = {};
      if (includeMembers) {
        params.includeMembers = "true";
        params.memberLimit = memberLimit.toString();
      }

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
  }, [poolId, includeMembers, memberLimit]);

  // Load data when parameters change
  useEffect(() => {
    if (poolId) {
      currentRequest.current = null; // Reset to allow new request
      loadPoolDetails();
    }
  }, [poolId, includeMembers, memberLimit, loadPoolDetails]);

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
    // New: Direct access to members and metadata
    members: pool?.members || [],
    hasMembers: includeMembers && (pool?.members?.length || 0) > 0,
    memberCount: pool?.members?.length || 0,
  };
};

export type { DetailedPool, PoolMember, MerkleRootHistory };
