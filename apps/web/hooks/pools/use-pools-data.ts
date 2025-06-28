//file:prepaid-gas-website/apps/web/hooks/pools/use-pools-data.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { prepaidPoolsApi } from "@/lib/api/api-client";
import type { Pool } from "@/types";
import { ApiError } from "@/lib/api/type";

interface UsePoolsDataResult {
  pools: Pool[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: string;
  refetch: () => Promise<void>;
}

export function usePoolsData(): UsePoolsDataResult {
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<string>("");

  // Add request deduplication
  const isRequestInProgress = useRef(false);
  const hasInitialLoad = useRef(false);

  const loadPools = useCallback(async () => {
    // Prevent duplicate requests
    if (isRequestInProgress.current) {
      console.log("🔄 Request already in progress, skipping...");
      return;
    }

    try {
      isRequestInProgress.current = true;
      setIsLoading(true);
      setError(null);

      console.log("🔍 Fetching pools data...");

      const response = await prepaidPoolsApi.getPools({
        page: 0,
        limit: 100,
        paginated: false,
      });

      if (!response.success) {
        throw new Error(response.error?.message || "Failed to load pools");
      }

      const poolsData = (response.data as Pool[]) || [];
      setPools(poolsData);
      setLastFetchTime(response.meta?.timestamp || new Date().toISOString());

      console.log(`✅ Loaded ${poolsData.length} pools`);
    } catch (err) {
      let errorMessage = "Failed to load cards. Please try again.";

      if (err instanceof ApiError) {
        switch (err.code) {
          case "NETWORK_ERROR":
            errorMessage =
              "Unable to connect to server. Please check your internet connection.";
            break;
          case "REQUEST_TIMEOUT":
            errorMessage = "Request timed out. Please try again later.";
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
      console.error("❌ Error fetching pools:", err);
    } finally {
      setIsLoading(false);
      isRequestInProgress.current = false;
    }
  }, []); // ✅ No dependencies - only changes when manually called

  // Load data only once on mount
  useEffect(() => {
    if (!hasInitialLoad.current) {
      hasInitialLoad.current = true;
      loadPools();
    }
  }, []); // ✅ Empty dependency array - runs only once

  return {
    pools,
    isLoading,
    error,
    lastFetchTime,
    refetch: loadPools,
  };
}
