"use client";

import React from "react";
import InfoRow from "./info-row";

/**
 * Interface for pool data needed by technical details
 */
interface PoolData {
  poolId: string;
  merkleTreeDuration: string;
  merkleTreeDepth: string;
  rootHistoryCount: number;
  currentRootIndex: number;
  membersCount: string;
  createdAtBlock: string;
  createdAt: string;
  network: {
    name: string;
    chainId: number;
    contracts: {
      paymaster: string;
    };
  };
}

/**
 * Props for TechnicalDetailsSection component
 */
interface TechnicalDetailsSectionProps {
  /** Pool data to display technical details for */
  pool: PoolData;
}

/**
 * Format duration in seconds to human readable
 */
const formatDuration = (seconds: string): string => {
  try {
    const sec = parseInt(seconds);
    const hours = Math.floor(sec / 3600);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    return `${Math.floor(sec / 60)}m`;
  } catch {
    return "Unknown";
  }
};

/**
 * Format address for display
 */
const formatAddress = (address: string): string => {
  if (!address) return "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
 * TechnicalDetailsSection Component
 * 
 * Single Responsibility: Display technical specifications and security details
 * 
 * Features:
 * - Smart contract information
 * - Privacy and security metrics
 * - Copyable addresses and technical values
 * - Organized two-column layout
 */
const TechnicalDetailsSection: React.FC<TechnicalDetailsSectionProps> = ({ pool }) => {
  const duration = formatDuration(pool.merkleTreeDuration);
  const createdDate = new Date(parseInt(pool.createdAt) * 1000);

  return (
    <div className="card-prepaid-glass card-content-lg">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">🔧</span>
        Technical Specifications
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Smart Contract Details */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wide flex items-center gap-2">
            📄 Smart Contract
          </h3>
          <div className="space-y-4">
            <InfoRow
              label="Pool ID"
              value={pool.poolId}
              valueClass="font-mono text-purple-400"
            />
            <InfoRow
              label="Network"
              value={`${pool.network.name} (${pool.network.chainId})`}
              valueClass="text-blue-400"
            />
            <InfoRow
              label="Paymaster"
              value={formatAddress(pool.network.contracts.paymaster)}
              valueClass="font-mono text-slate-300"
              copyable={pool.network.contracts.paymaster}
            />
            <InfoRow
              label="Created Block"
              value={formatNumber(pool.createdAtBlock)}
              valueClass="font-mono text-slate-400"
            />
            <InfoRow
              label="Created Date"
              value={createdDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              valueClass="text-slate-300"
            />
          </div>
        </div>

        {/* Privacy & Security */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wide flex items-center gap-2">
            🔐 Privacy & Security
          </h3>
          <div className="space-y-4">
            <InfoRow
              label="Merkle Tree Depth"
              value={pool.merkleTreeDepth.toString()}
              valueClass="text-blue-400"
            />
            <InfoRow
              label="Root Duration"
              value={duration}
              valueClass="text-green-400"
            />
            <InfoRow
              label="Root History Size"
              value={pool.rootHistoryCount.toString()}
              valueClass="text-yellow-400"
            />
            <InfoRow
              label="Current Root Index"
              value={pool.currentRootIndex.toString()}
              valueClass="text-purple-400"
            />
            <InfoRow
              label="Anonymity Set"
              value={`${formatNumber(pool.membersCount)} members`}
              valueClass="text-green-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDetailsSection;