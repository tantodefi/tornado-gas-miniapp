"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PrepaidPoolCard from "@/components/ui/prepaid-pool-card";
import FilterBar, { FilterState } from "@/components/ui/filter-bar";

// Network Icons Component
const NetworkIcon: React.FC<{ network: any }> = ({ network }) => (
  <div
    className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg`}
    style={{ backgroundColor: network.color }}
  >
    {network.icon}
  </div>
);

// Demo Component showing pool marketplace
const PrepaidCardsPage: React.FC = () => {
  const samplePools = [
    {
      id: "PG-4337",
      amount: 0.05,
      members: 847,
      network: { name: "Base Sepolia", icon: "Ξ", color: "#627EEA" },
    },
  ];
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    network: "",
    amountRange: "",
    memberRange: "",
    sortBy: "newest",
  });

  // Filter function
  const filteredPools = useMemo(() => {
    let filtered = [...samplePools];

    // Network filter
    if (filters.network) {
      filtered = filtered.filter((pool) =>
        pool.network.name.toLowerCase().includes(filters.network.toLowerCase()),
      );
    }

    // Amount range filter
    if (filters.amountRange) {
      filtered = filtered.filter((pool) => {
        switch (filters.amountRange) {
          case "0-0.01":
            return pool.amount <= 0.01;
          case "0.01-0.05":
            return pool.amount > 0.01 && pool.amount <= 0.05;
          case "0.05-0.1":
            return pool.amount > 0.05 && pool.amount <= 0.1;
          case "0.1+":
            return pool.amount > 0.1;
          default:
            return true;
        }
      });
    }

    // Member range filter
    if (filters.memberRange) {
      filtered = filtered.filter((pool) => {
        switch (filters.memberRange) {
          case "small":
            return pool.members <= 500;
          case "medium":
            return pool.members > 500 && pool.members <= 1000;
          case "large":
            return pool.members > 1000;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "amount-high":
          return b.amount - a.amount;
        case "amount-low":
          return a.amount - b.amount;
        case "members-high":
          return b.members - a.members;
        case "members-low":
          return a.members - b.members;
        case "newest":
        default:
          return 0; // Keep original order for newest
      }
    });

    return filtered;
  }, [filters, samplePools]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleJoin = (poolId: string) => {
    console.log(`Joining pool: ${poolId}`);
  };

  const handleViewDetails = (poolId: string) => {
    console.log(`Viewing details for pool: ${poolId}`);
  };

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            className="heading-prepaid-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-prepaid-gradient-white">Prepaid Gas </span>
            <span className="text-prepaid-gradient-brand">Cards</span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Join anonymous gas credit pools. Select card to purchase prepaid gas
            credits.
          </motion.p>
        </div>
        {/* Filter Bar (NEW) */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          poolCount={filteredPools.length}
        />
        {/* Pool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
          {samplePools.map((pool, index) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <PrepaidPoolCard
                pool={pool}
                onJoin={handleJoin}
                onViewDetails={handleViewDetails}
              />
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-16">
          <p className="text-slate-400">More pools loading...</p>
        </div>
      </div>
    </div>
  );
};

export default PrepaidCardsPage;
