// app/components/ui/prepaid-pool-card.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Pool } from "@/types";

// Helper function to format joining fee (already a string from API)
const formatJoiningFee = (joiningFeeStr: string): string => {
  try {
    // If it's already in ETH format, return as is
    if (joiningFeeStr.includes(".")) {
      return joiningFeeStr;
    }
    // If it's in wei (large number), convert to ETH
    const wei = BigInt(joiningFeeStr);
    return (Number(wei) / 1e18).toString();
  } catch {
    return "0";
  }
};

// Helper function to format members count (already a string from API)
const formatMembersCount = (membersCountStr: string): string => {
  try {
    const count = parseInt(membersCountStr);
    return count.toLocaleString();
  } catch {
    return "0";
  }
};

const PrepaidPoolCard: React.FC<{
  pool: Pool;
  onCardClick?: (poolId: string) => void;
  onViewDetails?: (poolId: string) => void;
}> = ({ pool, onCardClick, onViewDetails }) => {
  const handleCardClick = () => {
    onCardClick?.(pool.poolId);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(pool.poolId);
  };

  const accountNumber = `**** **** **** ${pool.poolId.slice(-4).padStart(4, "0")}`;

  return (
    <motion.div
      className="perspective-1000 cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="w-[250px] h-[150px] sm:w-[280px] sm:h-[168px] lg:w-[320px] lg:h-[192px] mx-auto bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl lg:rounded-2xl border border-purple-500/30 relative shadow-2xl"
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl lg:rounded-2xl" />

        <div className="p-4 sm:p-5 lg:p-6 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-start ">
              <div className="text-xs sm:text-sm text-pink-500 font-bold">
                PREPAID
              </div>
              <div className="text-xs text-slate-500">GAS CREDIT</div>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-md sm:text-lg lg:text-xl font-bold text-purple-500">
                {formatJoiningFee(pool.joiningFee)} ETH
              </div>
              <div className="text-[10px] text-slate-500">
                {formatMembersCount(pool.membersCount)} members
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="font-mono text-[10px] sm:text-xs text-slate-500">
              {accountNumber}
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">{pool.network.name}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PrepaidPoolCard;
