//file:prepaid-gas-website/apps/web/hooks/pools/use-pools-filter.ts
import type { Pool, FilterState } from "@/types";
import { useState, useMemo, useCallback } from "react";

interface UsePoolsFilterResult {
  filteredPools: Pool[];
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string) => void;
  resetFilters: () => void;
  poolCount: number;
}

/**
 * Business logic hook for pool filtering and sorting
 * Single responsibility: filter and sort pool data
 * No data fetching, no UI concerns
 */
export function usePoolsFilter(pools: Pool[]): UsePoolsFilterResult {
  const [filters, setFilters] = useState<FilterState>({
    network: "",
    amountRange: "",
    memberRange: "",
    sortBy: "newest",
  });

  const setFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      network: "",
      amountRange: "",
      memberRange: "",
      sortBy: "newest",
    });
  }, []);

  const filteredPools = useMemo(() => {
    let filtered = [...pools];

    // Apply network filter
    if (filters.network) {
      filtered = filtered.filter((pool) => {
        const networkName = pool.network.name.toLowerCase();
        return networkName.includes(filters.network.toLowerCase());
      });
    }

    // Apply amount range filter
    if (filters.amountRange) {
      filtered = filtered.filter((pool) => {
        const amount = parseFloat(pool.joiningFee);
        switch (filters.amountRange) {
          case "0-0.01":
            return amount >= 0 && amount <= 0.01;
          case "0.01-0.05":
            return amount > 0.01 && amount <= 0.05;
          case "0.05-0.1":
            return amount > 0.05 && amount <= 0.1;
          case "0.1+":
            return amount > 0.1;
          default:
            return true;
        }
      });
    }

    // Apply member range filter
    if (filters.memberRange) {
      filtered = filtered.filter((pool) => {
        const memberCount = parseInt(pool.membersCount);
        switch (filters.memberRange) {
          case "small":
            return memberCount < 100;
          case "medium":
            return memberCount >= 100 && memberCount < 500;
          case "large":
            return memberCount >= 500;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "amount-high":
          return parseFloat(b.joiningFee) - parseFloat(a.joiningFee);
        case "amount-low":
          return parseFloat(a.joiningFee) - parseFloat(b.joiningFee);
        case "members-high":
          return parseInt(b.membersCount) - parseInt(a.membersCount);
        case "members-low":
          return parseInt(a.membersCount) - parseInt(b.membersCount);
        default:
          return 0;
      }
    });

    return filtered;
  }, [pools, filters]);

  return {
    filteredPools,
    filters,
    setFilter,
    resetFilters,
    poolCount: filteredPools.length,
  };
}
