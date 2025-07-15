//file:prepaid-gas-website/apps/web/hooks/pools/use-pools-filter.ts
import { useState, useMemo } from "react";
import type { Pool } from "@/types/pool";
import { PaymasterType } from "@prepaid-gas/data";

/**
 * Filter state for pool filtering and sorting
 */
export interface FilterState {
  network: string;
  poolType: PaymasterType | "all";
  sortBy: string;
}

/**
 * Custom hook for filtering and sorting pools
 * Updated to use new field names from data package
 */
export const usePoolsFilter = (pools: Pool[]) => {
  const [filters, setFilters] = useState<FilterState>({
    network: "all",
    poolType: "all",
    sortBy: "newest",
  });

  const setFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      network: "all",
      poolType: "all",
      sortBy: "newest",
    });
  };

  const filteredPools = useMemo(() => {
    let filtered = [...pools];

    // Apply network filter
    if (filters.network !== "all") {
      filtered = filtered.filter((pool) => pool.network === filters.network);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return (
            new Date(b.createdAtTimestamp).getTime() -
            new Date(a.createdAtTimestamp).getTime()
          );

        default:
          return 0;
      }
    });

    if (filters.poolType !== "all") {
      filtered = filtered.filter(
        (pool) => pool.paymaster.contractType === filters.poolType,
      );
    }

    return filtered;
  }, [pools, filters]);

  return {
    filteredPools,
    filters,
    setFilter,
    resetFilters,
    poolCount: filteredPools.length,
  };
};
