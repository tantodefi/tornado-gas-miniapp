//file:prepaid-gas-website/apps/web/components/features/pools/pool-activity-section.tsx
"use client";

import React from "react";
import { Pool,Activity } from "@/types/pool";
import { getExplorerUrl, getTimeAgo } from "@/utils";
import { formatEther, formatGwei } from "viem";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

interface PoolActivitySectionProps {
  pool: Pool;
}

/**
 * ActivityRow Component
 * Displays individual activity information (member additions or transactions)
 */
const ActivityRow: React.FC<{
  activity: Activity;
  pool: Pool;
}> = ({ activity, pool }) => {
  const explorerUrl = pool.chainId
    ? getExplorerUrl(pool.chainId, activity.transaction)
    : null;

  const isDeposit = activity.type === "DEPOSIT";
  const rowTint = isDeposit ? "bg-green-300/3" : "bg-red-400/4";

  const renderAction = () => (
    <div className="flex items-center gap-2">
      <span className="text-xl">{isDeposit ? "👤" : "⛽"}</span>
      <span className="text-white">
        {isDeposit ? "Deposit" : "Gas Payment"}
      </span>
    </div>
  );

  const renderValue = () => {
    if (isDeposit) {
      return (
        <span className="text-green-400 font-medium">
          + {formatEther(BigInt(pool.joiningAmount))} ETH
        </span>
      );
    } else {
      const gasCost = parseFloat(
        formatGwei(BigInt(activity.actualGasCost || "0")),
      ).toFixed(3);
      return <span className="text-red-400 font-medium">- {gasCost} Gwei</span>;
    }
  };

  return (
    <TableRow
      className={`${rowTint} hover:bg-slate-800/40 border-slate-700/50 transition rounded px-2 py-3`}
    >
      <TableCell className="font-medium">{renderAction()}</TableCell>
      <TableCell>{renderValue()}</TableCell>
      <TableCell className="text-slate-400">
        {getTimeAgo(activity.timestamp)}
      </TableCell>
      <TableCell className="text-slate-400 text-center">
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline hover:text-purple-400 transition-colors"
          >
            ↗
          </a>
        )}
      </TableCell>
    </TableRow>
  );
};

/**
 * PoolActivitySection Component
 */
const PoolActivitySection: React.FC<PoolActivitySectionProps> = ({ pool }) => {
  const activities = pool?.activities || [];

  return (
    <>
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        Recent Activity
      </h2>

      {activities.length > 0 ? (
        <div className="space-y-2">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700/50">
                <TableHead className="text-slate-400">Action</TableHead>
                <TableHead className="text-slate-400">Value</TableHead>
                <TableHead className="text-slate-400">Time</TableHead>
                <TableHead className="text-slate-400 text-center">
                  Explorer
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  pool={pool}
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
            Activity will appear here when members join the pool or use it for
            gas payments.
          </p>
        </div>
      )}
    </>
  );
};

export default PoolActivitySection;
