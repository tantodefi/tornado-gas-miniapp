//file:prepaid-gas-website/apps/web/hooks/pools/use-pools-filter.ts
import { useState, useMemo } from "react";
import type { Pool, FilterState } from "@/types";

/**
 * Custom hook for filtering and sorting pools
 * Updated to use new field names from data package
 */
export const usePoolsFilter = (pools: Pool[]) => {
  const [filters, setFilters] = useState<FilterState>({
    network: "all",
    amountRange: "all",
    memberRange: "all",
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
      amountRange: "all",
      memberRange: "all",
      sortBy: "newest",
    });
  };

  const filteredPools = useMemo(() => {
    let filtered = [...pools];

    // Apply network filter
    if (filters.network !== "all") {
      filtered = filtered.filter((pool) => pool.network === filters.network);
    }

    // Apply amount range filter
    if (filters.amountRange !== "all") {
      filtered = filtered.filter((pool) => {
        const amount = parseFloat(pool.joiningFee);
        switch (filters.amountRange) {
          case "0-0.1":
            return amount >= 0 && amount <= 0.1;
          case "0.1-0.5":
            return amount > 0.1 && amount <= 0.5;
          case "0.5-1":
            return amount > 0.5 && amount <= 1;
          case "1+":
            return amount > 1;
          default:
            return true;
        }
      });
    }

    // Apply member range filter
    if (filters.memberRange !== "all") {
      filtered = filtered.filter((pool) => {
        const memberCount = parseInt(pool.memberCount); // Updated from membersCount
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
            new Date(b.createdAtTimestamp).getTime() - // Updated from createdAt
            new Date(a.createdAtTimestamp).getTime() // Updated from createdAt
          );
        case "amount-high":
          return parseFloat(b.joiningFee) - parseFloat(a.joiningFee);
        case "amount-low":
          return parseFloat(a.joiningFee) - parseFloat(b.joiningFee);
        case "members-high":
          return parseInt(b.memberCount) - parseInt(a.memberCount); // Updated from membersCount
        case "members-low":
          return parseInt(a.memberCount) - parseInt(b.memberCount); // Updated from membersCount
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
};
