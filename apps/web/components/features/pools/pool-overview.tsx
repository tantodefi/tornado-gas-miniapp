//file:prepaid-gas-website/apps/web/components/features/pools/pool-overview.tsx
"use client";

import React from "react";
import type { PoolOverviewData } from "@/types";

/**
 * Props for PoolOverview component
 */
interface PoolOverviewProps {
  /** Pool data to display in overview */
  pool: PoolOverviewData;
}

/**
 * Format wei amount to ETH display
 */
const formatEthAmount = (weiString: string): string => {
  try {
    const wei = BigInt(weiString);
    const eth = Number(wei) / 1e18;

    if (eth === 0) return "0.00";
    if (eth < 0.0001) return "< 0.0001";
    if (eth < 1) return eth.toFixed(6).replace(/\.?0+$/, "");
    return eth.toFixed(4).replace(/\.?0+$/, "");
  } catch {
    return "0.00";
  }
};

/**
 * Format large numbers with K/M suffixes
 */
const formatNumber = (num: string | number): string => {
  try {
    const n = typeof num === "string" ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  } catch {
    return "0";
  }
};

/**
 * PoolOverview Component
 *
 * Single Responsibility: Display key pool metrics and overview information
 *
 * Features:
 * - Key metrics grid (fee, value, members, year)
 * - Network and privacy information
 * - Formatted ETH amounts and member counts
 * - Clean card layout with proper spacing
 */
const PoolOverview: React.FC<PoolOverviewProps> = ({ pool }) => {
  const joiningFeeEth = formatEthAmount(pool.joiningFee);
  const totalDepositsEth = formatEthAmount(pool.totalDeposits || "0");
  const createdDate = new Date(parseInt(pool.createdAtTimestamp) * 1000); // Updated field name

  return (
    <div className="card-prepaid-glass card-content-md">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        📋 Pool Overview
      </h3>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {joiningFeeEth}
          </div>
          <div className="text-xs text-slate-400">Entry Fee (ETH)</div>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-400">
            {totalDepositsEth}
          </div>
          <div className="text-xs text-slate-400">Pool Value (ETH)</div>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {formatNumber(pool.memberCount)} {/* Updated field name */}
          </div>
          <div className="text-xs text-slate-400">Members</div>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">
            {createdDate.getFullYear()}
          </div>
          <div className="text-xs text-slate-400">
            Est. {createdDate.getFullYear()}
          </div>
        </div>
      </div>

      {/* Network and Privacy Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Network</span>
          <span className="text-blue-400">{pool.network}</span>
        </div>
      </div>
    </div>
  );
};

export default PoolOverview;
