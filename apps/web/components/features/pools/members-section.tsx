//file:prepaid-gas-website/apps/web/components/features/pools/members-section.tsx
"use client";

import React from "react";
import PoolMembersList from "./pool-members-list";
import type { MemberData } from "@/types";

/**
 * Interface for pool data needed by members section
 */
interface PoolData {
  poolId: string;
  membersCount: string;
  createdAt: string;
}

/**
 * Props for MembersSection component
 */
interface MembersSectionProps {
  /** Pool data for member context */
  pool: PoolData;
  /** Array of member data */
  members: MemberData[];
  /** Whether members list is currently shown */
  showMembers: boolean;
  /** Current member limit for pagination */
  memberLimit: number;
  /** Whether member data is currently loading */
  isLoading: boolean;
  /** Handler for toggling member visibility */
  onToggleMembers: () => void;
  /** Handler for changing member limit */
  onMemberLimitChange: (limit: number) => void;
}
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
 * MembersSection Component
 *
 * Single Responsibility: Manage pool members display and interaction
 *
 * Features:
 * - Members count display
 * - Show/hide members functionality
 * - Member limit selection
 * - Statistics when members are hidden
 * - Integration with PoolMembersList component
 */
const MembersSection: React.FC<MembersSectionProps> = ({
  pool,
  members,
  showMembers,
  memberLimit,
  isLoading,
  onToggleMembers,
  onMemberLimitChange,
}) => (
  <div className="card-prepaid-glass card-content-lg">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="text-2xl">👥</span>
        Pool Members ({formatNumber(pool.membersCount)})
      </h2>

      <div className="flex items-center gap-3">
        {showMembers && (
          <select
            value={memberLimit}
            onChange={(e) => onMemberLimitChange(parseInt(e.target.value))}
            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value={50}>Show 50</option>
            <option value={100}>Show 100</option>
            <option value={200}>Show 200</option>
            <option value={500}>Show 500</option>
          </select>
        )}

        <button
          onClick={onToggleMembers}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            showMembers
              ? "bg-purple-500 text-white hover:bg-purple-600"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          {showMembers ? "Hide Members" : "Show Members"}
        </button>
      </div>
    </div>

    {showMembers ? (
      <PoolMembersList
        members={members}
        isLoading={isLoading}
        poolId={pool.poolId}
      />
    ) : (
      <div className="text-center py-8">
        <div className="text-4xl mb-4 opacity-50">👥</div>
        <p className="text-slate-400 mb-4">
          Click "Show Members" to view identity commitments and join history
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
          <div className="bg-slate-800/30 rounded p-3">
            <div className="text-purple-400 font-bold">
              {formatNumber(pool.membersCount)}
            </div>
            <div className="text-slate-500">Total</div>
          </div>
          <div className="bg-slate-800/30 rounded p-3">
            <div className="text-green-400 font-bold">
              ~{formatNumber(Math.floor(parseInt(pool.membersCount) * 0.9))}
            </div>
            <div className="text-slate-500">Active</div>
          </div>
          <div className="bg-slate-800/30 rounded p-3">
            <div className="text-blue-400 font-bold">
              {new Date(parseInt(pool.createdAt) * 1000).getFullYear()}
            </div>
            <div className="text-slate-500">Since</div>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default MembersSection;
