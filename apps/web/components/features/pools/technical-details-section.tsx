//file:prepaid-gas-website/apps/web/components/features/pools/technical-details-section.tsx
"use client";

import React from "react";
import InfoRow from "./info-row";
import type { PoolTechnicalData } from "@/types";

/**
 * Props for TechnicalDetailsSection component
 */
interface TechnicalDetailsSectionProps {
  /** Pool data to display technical details for */
  pool: PoolTechnicalData;
}
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
const TechnicalDetailsSection: React.FC<TechnicalDetailsSectionProps> = ({
  pool,
}) => {
  const createdDate = new Date(parseInt(pool.createdAtTimestamp) * 1000);

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
              value={`${pool.network} (${pool.chainId})`}
              valueClass="text-blue-400"
            />
            <InfoRow
              label="Paymaster"
              value={formatAddress(pool.paymaster.address)}
              valueClass="font-mono text-slate-300"
              copyable={pool.paymaster.address}
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
              value={`${formatNumber(pool.memberCount)} members`}
              valueClass="text-green-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDetailsSection;
