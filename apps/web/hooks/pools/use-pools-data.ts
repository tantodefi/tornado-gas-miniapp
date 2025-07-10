//file:prepaid-gas-website/apps/web/hooks/pools/use-pools-data.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { prepaidPoolsApi } from "@/lib/api/api-client";
import type { Pool } from "@/types/pool";
import { ApiError } from "@/lib/api/type";

interface UsePoolsDataResult {
  pools: Pool[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: string;
  refetch: () => Promise<void>;
}

export function usePoolsData(initialData?: Pool[]): UsePoolsDataResult {
  const [pools, setPools] = useState<Pool[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(initialData ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<string>("");

  const isRequestInProgress = useRef(false);
  const hasInitialLoad = useRef(!!initialData);

  const loadPools = useCallback(async () => {
    if (isRequestInProgress.current) return;

    try {
      isRequestInProgress.current = true;
      setIsLoading(true);
      setError(null);

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
    } finally {
      setIsLoading(false);
      isRequestInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    if (!hasInitialLoad.current) {
      hasInitialLoad.current = true;
      loadPools();
    }
  }, [loadPools]);

  return {
    pools,
    isLoading,
    error,
    lastFetchTime,
    refetch: loadPools,
  };
}
