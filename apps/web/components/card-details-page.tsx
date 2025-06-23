"use client";

import React from "react";
import { motion } from "framer-motion";
import { useCardDetails } from "@/hooks/use-card-details";
import PrepaidPoolCard from "./ui/prepaid-pool-card";

// Types following our established patterns
interface DetailedPool {
  id: string;
  amount: number;
  members: number;
  maxMembers: number;
  network: {
    name: string;
    icon: string;
    color: string;
  };
  createdAt: string;
  status: "active" | "full" | "low";
  totalTransactions: number;
  averageGasCost: number;
  description?: string;
  memberList: PoolMember[];
  recentTransactions: Transaction[];
}

interface PoolMember {
  id: string;
  joinedAt: string;
  contributedAmount: number;
  gasUsed: number;
}

interface Transaction {
  id: string;
  type: "join" | "gas_usage" | "refund";
  amount: number;
  timestamp: string;
  txHash?: string;
  member: string;
}

interface CardDetailsPageProps {
  poolId: string;
  onBack: () => void;
  onJoinPool: (poolId: string) => void;
}

// Stats grid component
const StatsGrid: React.FC<{ pool: DetailedPool }> = ({ pool }) => {
  const stats = [
    {
      label: "Pool Members",
      value: `${pool.members}/${pool.maxMembers}`,
      icon: "👥",
    },
    {
      label: "Total Transactions",
      value: pool.totalTransactions.toLocaleString(),
      icon: "📊",
    },
    {
      label: "Avg Gas Cost",
      value: `${pool.averageGasCost.toFixed(4)} ETH`,
      icon: "⛽",
    },
    {
      label: "Created",
      value: new Date(pool.createdAt).toLocaleDateString(),
      icon: "📅",
    },
  ];

  return (
    <div className="grid-prepaid-stats">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="card-prepaid-glass card-content-sm text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div className="text-lg font-bold text-purple-400 mb-1">
            {stat.value}
          </div>
          <div className="text-xs text-slate-400">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

// Recent transactions component
const RecentTransactions: React.FC<{ transactions: Transaction[] }> = ({
  transactions,
}) => {
  if (!transactions.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        <div className="text-4xl mb-2">📝</div>
        <p>No recent transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.slice(0, 5).map((tx, index) => (
        <motion.div
          key={tx.id}
          className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-600/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                tx.type === "join"
                  ? "bg-green-500/20 text-green-400"
                  : tx.type === "gas_usage"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-purple-500/20 text-purple-400"
              }`}
            >
              {tx.type === "join"
                ? "➕"
                : tx.type === "gas_usage"
                  ? "⛽"
                  : "💰"}
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                {tx.type === "join"
                  ? "Pool Join"
                  : tx.type === "gas_usage"
                    ? "Gas Usage"
                    : "Refund"}
              </div>
              <div className="text-xs text-slate-400">
                {new Date(tx.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-sm font-bold ${
                tx.type === "refund" ? "text-green-400" : "text-slate-300"
              }`}
            >
              {tx.type === "refund" ? "+" : "-"}
              {tx.amount.toFixed(4)} ETH
            </div>
            {tx.txHash && (
              <div className="text-xs text-purple-400 font-mono">
                {tx.txHash.slice(0, 8)}...
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Main card details page component
const CardDetailsPage: React.FC<CardDetailsPageProps> = ({
  poolId,
  onBack,
  onJoinPool,
}) => {
  const { pool, isLoading, error, refetch } = useCardDetails(poolId);

  const handleJoinClick = () => {
    onJoinPool(poolId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Loading skeleton */}
          <div className="text-center mb-12">
            <div className="w-32 h-8 bg-slate-700/50 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="w-64 h-6 bg-slate-700/50 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="w-full max-w-[400px] h-[240px] mx-auto bg-slate-800/50 rounded-2xl animate-pulse mb-8"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-slate-800/50 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Error Loading Pool Details
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={refetch} className="btn-prepaid-primary btn-md">
                Try Again
              </button>
              <button onClick={onBack} className="btn-prepaid-outline btn-md">
                Back to Cards
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!pool) return null;

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono"
          >
            ← Back to Cards
          </button>
          <div className="text-xs text-slate-500 font-mono">Pool Details</div>
        </div>

        {/* Pool Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="heading-prepaid-section mb-4">
            <span className="text-prepaid-gradient-white">Pool </span>
            <span className="text-prepaid-gradient-brand">{pool.id}</span>
          </h1>
        </motion.div>

        {/* Card Display */}
        <div className="mb-12">
          <PrepaidPoolCard pool={pool} />
        </div>

        {/* Stats Grid */}
        <div className="mb-12">
          <StatsGrid pool={pool} />
        </div>

        {/* Join Pool CTA */}
        {pool.status === "active" && pool.members < pool.maxMembers && (
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              onClick={handleJoinClick}
              className="btn-prepaid-primary btn-lg"
            >
              Join Pool for {pool.amount} ETH →
            </button>
            <p className="text-xs text-slate-400 mt-2">
              Join this pool to start using prepaid gas credits
            </p>
          </motion.div>
        )}

        {/* Recent Transactions */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            Recent Activity
          </h2>
          <div className="card-prepaid-glass card-content-md">
            <RecentTransactions transactions={pool.recentTransactions} />
          </div>
        </motion.section>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>🔒 All transactions are private and unlinkable</p>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsPage;
