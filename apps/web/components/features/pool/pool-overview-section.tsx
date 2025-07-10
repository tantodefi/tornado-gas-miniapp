//file:prepaid-gas-website/apps/web/components/features/pools/pool-overview.tsx
"use client";

import React from "react";
import { Pool } from "@/types/pool";
import { formatEther } from "viem";

/**
 * Props for PoolOverview component
 */
interface PoolOverviewProps {
  pool: Pool;
}

/**
 * PoolOverview Component
 */
const PoolOverviewSection: React.FC<PoolOverviewProps> = ({ pool }) => {
  const joiningFeeEth = formatEther(BigInt(pool.joiningFee || "0"));
  const totalDepositsEth = parseFloat(
    formatEther(BigInt(pool.totalDeposits || "0")),
  ).toFixed(6);
  const createdDate = new Date(parseInt(pool.createdAtTimestamp) * 1000);

  return (
    <div className="card-prepaid-glass card-content-md">
      <div className="flex justify-between">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          📋 Pool Overview
        </h3>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          Pool {pool.poolId}
        </h3>
      </div>

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
            {pool.memberCount}
          </div>
          <div className="text-xs text-slate-400">Members</div>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">
            {createdDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-xs text-slate-400">
            {createdDate.getFullYear()}
          </div>
        </div>
      </div>

      {/* Network and Privacy Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Network</span>
          <span className="text-blue-400">{pool.network}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Paymaster Address</span>
          <span className="text-blue-400">
            {`${pool.paymaster.address.slice(0, 6)}...${pool.paymaster.address.slice(-4)}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PoolOverviewSection;
