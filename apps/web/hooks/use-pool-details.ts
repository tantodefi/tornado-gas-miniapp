// hooks/use-pool-details.ts
import { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/api-client";

// ✅ Updated types to match actual PoolData from SDK
interface DetailedPool {
  id: string;
  poolId: string;
  joiningFee: string; // ✅ BigInt from subgraph
  merkleTreeDuration: string; // ✅ BigInt from subgraph
  totalDeposits: string; // ✅ BigInt from subgraph
  currentMerkleTreeRoot: string; // ✅ BigInt from subgraph
  membersCount: string; // ✅ BigInt from subgraph (renamed from members)
  merkleTreeDepth: string; // ✅ BigInt from subgraph
  createdAt: string; // ✅ BigInt timestamp from subgraph
  createdAtBlock: string; // ✅ BigInt from subgraph
  currentRootIndex: number; // ✅ Int from subgraph
  rootHistoryCount: number; // ✅ Int from subgraph

  // ✅ Network metadata (required for every pool)
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

  // Additional data that might be fetched
  memberList?: PoolMember[];
  rootHistory?: MerkleRootHistory[];
}

// ✅ Updated PoolMember to match actual subgraph schema
interface PoolMember {
  id: string; // poolId-memberIndex
  identityCommitment: string; // The actual identity commitment
  memberIndex: string; // Member's index in the pool
  joinedAt: string; // Timestamp when joined
  joinedAtBlock: string; // Block number when joined
  isActive: boolean; // Whether member is still active
}

// ✅ Updated MerkleRootHistory to match subgraph schema
interface MerkleRootHistory {
  id: string; // poolId-index
  index: number; // Root index in history
  merkleRoot: string; // The merkle root value (BigInt)
  createdAt: string; // Timestamp when created (BigInt)
  createdAtBlock: string; // Block number when created (BigInt)
  isValid: boolean; // Whether root is still in valid window
  transactionHash: string; // Transaction hash where root was created
}

// ✅ API response structure - Use the same ApiResponse from api-client
interface PoolDetailsResponse {
  success: boolean;
  data?: DetailedPool;
  error?: {
    message: string;
    code: string;
    timestamp?: string;
  };
  meta?: {
    network: string;
    chainId: number;
    chainName: string;
    networkName: string;
    contracts: {
      paymaster: string;
      verifier?: string;
    };
    requestId: string;
    processingTime: number;
  };
}

// API function for fetching pool details
const fetchPoolDetails = async (poolId: string): Promise<DetailedPool> => {
  try {
    const response = await fetch(`/api/prepaid-pools/${poolId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        errorData.error?.code || "HTTP_ERROR",
        response.status,
      );
    }

    const data: PoolDetailsResponse = await response.json();

    if (!data.success) {
      throw new ApiError(
        data.error?.message || "Failed to fetch pool details",
        data.error?.code || "API_ERROR",
        response.status,
      );
    }

    if (!data.data) {
      throw new ApiError("No pool data received", "NO_DATA", response.status);
    }

    if (!data.meta) {
      throw new ApiError(
        "No network metadata received",
        "NO_META",
        response.status,
      );
    }

    // ✅ Always include network metadata with pool data
    return {
      ...data.data,
      network: {
        name: data.meta.chainName,
        chainId: data.meta.chainId,
        chainName: data.meta.chainName,
        networkName: data.meta.networkName,
        contracts: data.meta.contracts,
      },
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        "Network error: Unable to connect to the server",
        "NETWORK_ERROR",
      );
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred",
      "UNKNOWN_ERROR",
    );
  }
};

// Custom hook for managing pool details state
export const usePoolDetails = (poolId: string) => {
  const [pool, setPool] = useState<DetailedPool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPoolDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const poolData = await fetchPoolDetails(poolId);
      setPool(poolData);
    } catch (err) {
      let errorMessage = "Failed to load pool details.";

      if (err instanceof ApiError) {
        switch (err.code) {
          case "NETWORK_ERROR":
            errorMessage =
              "Unable to connect to server. Please check your connection.";
            break;
          case "HTTP_ERROR":
            if (err.status === 404) {
              errorMessage = "Pool not found. It may have been removed.";
            } else {
              errorMessage = `Server error (${err.status}). Please try again later.`;
            }
            break;
          default:
            errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Error fetching pool details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [poolId]);

  // Load data on mount and when poolId changes
  useEffect(() => {
    if (poolId) {
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
