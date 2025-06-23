// hooks/use-card-details.ts
import { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/api-client";

// Types for detailed pool data
interface DetailedPool {
  id: string;
  amount: number;
  members: number;
  maxMembers: number;
  network: {
    name: string;
    icon: string;
    color: string;
  };
  createdAt: string;
  status: "active" | "full" | "low";
  totalTransactions: number;
  averageGasCost: number;
  description?: string;
  memberList: PoolMember[];
  recentTransactions: Transaction[];
}

interface PoolMember {
  id: string;
  joinedAt: string;
  contributedAmount: number;
  gasUsed: number;
}

interface Transaction {
  id: string;
  type: "join" | "gas_usage" | "refund";
  amount: number;
  timestamp: string;
  txHash?: string;
  member: string;
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

    const data = await response.json();

    if (!data.success) {
      throw new ApiError(
        data.error?.message || "Failed to fetch pool details",
        data.error?.code || "API_ERROR",
        response.status,
      );
    }

    return data.data;
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

// Custom hook for managing card details state
export const useCardDetails = (poolId: string) => {
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

  return {
    pool,
    isLoading,
    error,
    refetch,
  };
};

export type { DetailedPool, PoolMember, Transaction };
