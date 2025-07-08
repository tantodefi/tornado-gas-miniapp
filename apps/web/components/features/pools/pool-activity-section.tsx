//file:prepaid-gas-website/apps/web/components/features/pools/pool-activity-section.tsx
"use client";

import React from "react";
import { PoolWithActivity, ActivityItem } from "@/types"; // Updated imports
import { getExplorerUrl, getTimeAgo } from "@/utils";
import { formatGwei } from "viem";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

/**
 * Pool data interface (updated to use PoolWithActivity)
 */
interface PoolActivitySectionProps {
  pool?: PoolWithActivity; // Updated to use PoolWithActivity
  isLoading?: boolean;
}

/**
 * ActivityRow Component
 * Displays individual activity information (member additions or transactions)
 */
const ActivityRow: React.FC<{
  activity: ActivityItem;
  chainId?: string;
}> = ({ activity, chainId }) => {
  const explorerUrl = chainId
    ? getExplorerUrl(chainId, activity.transactionHash)
    : null;

  // Render different content based on activity type
  const renderAction = () => {
    if (activity.type === "member_added") {
      return (
        <div className="flex items-center gap-2">
          <span className="text-2xl">👤</span>
          {explorerUrl ? (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-400 transition-colors flex items-center gap-1"
            >
              Member Joined
              <span className="text-slate-400 text-xs">↗</span>
            </a>
          ) : (
            <span className="text-white">Member Joined</span>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛽</span>
          {explorerUrl ? (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-400 transition-colors flex items-center gap-1"
            >
              Gas Payment
              <span className="text-slate-400 text-xs">↗</span>
            </a>
          ) : (
            <span className="text-white">Gas Payment</span>
          )}
        </div>
      );
    }
  };

  // Render different values based on activity type
  const renderValue = () => {
    if (activity.type === "member_added") {
      return (
        <span className="text-blue-400 font-medium">
          Index #{activity.member.memberIndex}
        </span>
      );
    } else {
      return (
        <span className="text-green-400 font-medium">
          {parseFloat(
            formatGwei(BigInt(activity.transaction.actualGasCost || "0")),
          ).toFixed(3)}{" "}
          Gwei
        </span>
      );
    }
  };

  return (
    <TableRow className="hover:bg-slate-800/40 border-slate-700/50">
      {/* Action */}
      <TableCell className="font-medium">
        {renderAction()}
      </TableCell>

      {/* Value */}
      <TableCell>
        {renderValue()}
      </TableCell>

      {/* Time */}
      <TableCell className="text-slate-400 text-right">
        {getTimeAgo(activity.timestamp)}
      </TableCell>
    </TableRow>
  );
};

/**
 * LoadingSkeleton Component
 * Shows loading state for activities
 */
const LoadingSkeleton: React.FC = () => (
  <Table>
    <TableHeader>
      <TableRow className="border-slate-700/50">
        <TableHead className="text-slate-400">Action</TableHead>
        <TableHead className="text-slate-400">Value</TableHead>
        <TableHead className="text-slate-400 text-right">Time</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i} className="border-slate-700/50">
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-700 rounded w-24"></div>
            </div>
          </TableCell>
          <TableCell>
            <div className="h-4 bg-slate-700 rounded w-16"></div>
          </TableCell>
          <TableCell className="text-right">
            <div className="h-4 bg-slate-700 rounded w-12 ml-auto"></div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/**
 * PoolActivitySection Component
 *
 * Single Responsibility: Display unified pool activity in a clean, scannable format
 *
 * Features:
 * - Unified activity feed showing both member additions and transactions
 * - Single-line activity entries with 3 key fields: Action, Value, Time
 * - Different icons and styling for different activity types
 * - Clickable explorer links for activity verification
 * - Loading state with matching skeleton
 * - Empty state for pools with no activity
 * - Maintains consistent card styling
 * - Responsive layout with proper spacing
 */
const PoolActivitySection: React.FC<PoolActivitySectionProps> = ({
  pool,
  isLoading = false,
}) => {
  // Use the new unified activity array instead of userOperations
  const activities = pool?.activity || [];

  return (
    <div className="card-prepaid-glass card-content-lg">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        Recent Activity
      </h2>

      {isLoading ? (
        <LoadingSkeleton />
      ) : activities.length > 0 ? (
        <div>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700/50">
                <TableHead className="text-slate-400">Action</TableHead>
                <TableHead className="text-slate-400">Value</TableHead>
                <TableHead className="text-slate-400 text-right">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  chainId={pool?.chainId}
                />
              ))}
            </TableBody>
          </Table>

          {activities.length >= 50 && (
            <div className="text-center pt-4 mt-4 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm">
                Showing latest {activities.length} activities
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 opacity-60">
          <div className="text-4xl mb-4">📈</div>
          <p className="text-slate-400 mb-2">No activity yet</p>
          <p className="text-xs text-slate-500">
            Activity will appear here when members join the pool or use it for gas payments
          </p>
        </div>
      )}
    </div>
  );
};

export default PoolActivitySection;