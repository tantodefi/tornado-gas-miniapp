//file:prepaid-gas-website/apps/web/components/features/pools/pool-activity-section.tsx
"use client";

import React from "react";
import { Pool } from "@/types";
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
 * Transaction data interface
 */
interface Transaction {
  id: string;
  userOpHash: string;
  sender: string;
  actualGasCost: string;
  executedAtTimestamp: string;
  nullifier: string;
}

/**
 * Pool data interface (minimal, just what we need)
 */
interface PoolActivitySectionProps {
  pool?: Pool;
  isLoading?: boolean;
}

/**
 * TransactionItem Component
 * Displays individual transaction information in a single line
 */
const TransactionRow: React.FC<{
  transaction: Transaction;
  chainId?: string;
}> = ({ transaction, chainId }) => {
  const explorerUrl = chainId
    ? getExplorerUrl(chainId, transaction.userOpHash)
    : null;

  return (
    <TableRow className="hover:bg-slate-800/40 border-slate-700/50">
      {/* Action */}
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
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
      </TableCell>

      {/* Value */}
      <TableCell className="text-green-400 font-medium">
        {parseFloat(
          formatGwei(BigInt(transaction.actualGasCost || "0")),
        ).toFixed(3)}{" "}
        Gwei
      </TableCell>

      {/* Time */}
      <TableCell className="text-slate-400 text-right">
        {getTimeAgo(transaction.executedAtTimestamp)}
      </TableCell>
    </TableRow>
  );
};

/**
 * LoadingSkeleton Component
 * Shows loading state for transactions
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
 * Single Responsibility: Display pool transaction activity in a clean, scannable format
 *
 * Features:
 * - Single-line transaction entries with 3 key fields: Action, Value, Time
 * - Clickable explorer links for transaction verification
 * - Loading state with matching skeleton
 * - Empty state for pools with no transactions
 * - Maintains consistent card styling
 * - Responsive layout with proper spacing
 */
const PoolActivitySection: React.FC<PoolActivitySectionProps> = ({
  pool,
  isLoading = false,
}) => {
  const transactions = pool?.userOperations || [];

  return (
    <div className="card-prepaid-glass card-content-lg">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        Recent Activity
      </h2>

      {isLoading ? (
        <LoadingSkeleton />
      ) : transactions.length > 0 ? (
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
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  chainId={pool?.chainId}
                />
              ))}
            </TableBody>
          </Table>

          {transactions.length >= 20 && (
            <div className="text-center pt-4 mt-4 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm">
                Showing latest 20 transactions
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 opacity-60">
          <div className="text-4xl mb-4">💳</div>
          <p className="text-slate-400 mb-2">No transactions yet</p>
          <p className="text-xs text-slate-500">
            Transactions will appear here when members use the pool for gas
            payments
          </p>
        </div>
      )}
    </div>
  );
};

export default PoolActivitySection;
