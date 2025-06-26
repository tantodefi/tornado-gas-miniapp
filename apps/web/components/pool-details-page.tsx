"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePoolDetails } from "@/hooks/use-pool-details";
import PoolMembersList from "./ui/pool-members-list";
import { LabelHeader } from "./ui/page-header";
import IdentityGenerationFlow from "./identity/identity-generation-flow";
import { PoolCard } from "@/lib/storage/indexed-db-storage";
import PrepaidPoolCard from "./ui/prepaid-pool-card";

interface PoolDetailsPageProps {
  poolId: string;
}

/**
 * Format wei to ETH with proper decimals
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
 * Format large numbers
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

// Enhanced pool details page with better layout and fixed formatting
const PoolDetailsPage: React.FC<PoolDetailsPageProps> = ({ poolId }) => {
  const router = useRouter();
  const [showMembers, setShowMembers] = useState(false);
  const [memberLimit, setMemberLimit] = useState(100);
  const [showJoinFlow, setShowJoinFlow] = useState(false);

  const { pool, isLoading, error, refetch, members, hasMembers, memberCount } =
    usePoolDetails(poolId, showMembers, memberLimit);

  const handleBack = () => {
    router.push("/pools");
  };

  const handleJoinPool = () => {
    setShowJoinFlow(true);
  };

  const handleJoinFlowComplete = (card: PoolCard) => {
    setShowJoinFlow(false);
    router.push(`/cards/topup?card=${card.id}&pool=${poolId}`);
  };

  const handleJoinFlowCancel = () => {
    setShowJoinFlow(false);
  };

  const handleToggleMembers = () => {
    setShowMembers(!showMembers);
  };

  if (isLoading) {
    return <LoadingSkeleton onBack={handleBack} />;
  }

  if (error || !pool) {
    return <ErrorState error={error} onBack={handleBack} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <LabelHeader
          backText="← Back to Pools"
          onBack={handleBack}
          label="Pool Details"
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column - Pool Card & Overview */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-8"
            >
              {/* Pool Visual Card */}
              <div className="mb-6">
                <EnhancedPoolCard pool={pool} onJoin={handleJoinPool} />
              </div>

              {/* Pool Overview */}
              <PoolOverview pool={pool} />
            </motion.div>
          </div>

          {/* Right Column - Technical Details & Members */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Technical Specifications */}
              <TechnicalDetailsSection pool={pool} />

              {/* Members Section */}
              <MembersSection
                pool={pool}
                members={members}
                showMembers={showMembers}
                memberLimit={memberLimit}
                isLoading={isLoading}
                onToggleMembers={handleToggleMembers}
                onMemberLimitChange={setMemberLimit}
              />

              {/* Pool Activity */}
              <PoolActivitySection />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Identity Generation Flow Modal */}
      {showJoinFlow && pool && (
        <IdentityGenerationFlow
          pool={pool}
          onComplete={handleJoinFlowComplete}
          onCancel={handleJoinFlowCancel}
        />
      )}
    </div>
  );
};

/**
 * Enhanced Pool Card with FIXED formatting
 */
const EnhancedPoolCard: React.FC<{
  pool: any;
  onJoin: () => void;
}> = ({ pool, onJoin }) => {
  const joiningFeeEth = formatEthAmount(pool.joiningFee);
  const totalDepositsEth = formatEthAmount(pool.totalDeposits || "0");

  return (
    <div className="card-prepaid-glass card-content-lg overflow-hidden">
      {/* Pool Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-mono mb-3">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
          Pool {pool.poolId}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Gas Credit Pool</h1>
      </div>

      {/* Visual Pool Card */}
      <PrepaidPoolCard pool={pool} />

      {/* Join Action */}
      <div className="text-center">
        <button onClick={onJoin} className="btn-prepaid-primary btn-md my-3">
          Join Pool & Create Gas Card →
        </button>
        <p className="text-xs text-slate-400">
          Creates a secure identity and prepares your gas card
        </p>
      </div>
    </div>
  );
};

/**
 * Pool Overview - Key decision-making metrics
 */
const PoolOverview: React.FC<{ pool: any }> = ({ pool }) => {
  const joiningFeeEth = formatEthAmount(pool.joiningFee);
  const totalDepositsEth = formatEthAmount(pool.totalDeposits || "0");
  const createdDate = new Date(parseInt(pool.createdAt) * 1000);

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
            {formatNumber(pool.membersCount)}
          </div>
          <div className="text-xs text-slate-400">Members</div>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">
            {createdDate.getFullYear()}
          </div>
          <div className="text-xs text-slate-400">Est. Year</div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Network:</span>
          <span className="text-blue-400">{pool.network.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Privacy Level:</span>
          <span className="text-green-400">High Anonymity</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Technical & Security Details - Consolidated section
 */
const TechnicalDetailsSection: React.FC<{ pool: any }> = ({ pool }) => {
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

/**
 * Members section with better organization
 */
const MembersSection: React.FC<{
  pool: any;
  members: any[];
  showMembers: boolean;
  memberLimit: number;
  isLoading: boolean;
  onToggleMembers: () => void;
  onMemberLimitChange: (limit: number) => void;
}> = ({
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

/**
 * Pool activity section (placeholder for future features)
 */
const PoolActivitySection: React.FC = () => (
  <div className="card-prepaid-glass card-content-lg">
    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
      <span className="text-2xl">📊</span>
      Recent Activity
    </h2>

    <div className="text-center py-8 opacity-60">
      <div className="text-4xl mb-4">📈</div>
      <p className="text-slate-400 mb-2">Activity tracking coming soon</p>
      <p className="text-xs text-slate-500">
        Pool transactions, member joins, and gas usage statistics
      </p>
    </div>
  </div>
);

/**
 * Enhanced info row component with copy functionality
 */
const InfoRow: React.FC<{
  label: string;
  value: string;
  valueClass?: string;
  copyable?: string;
}> = ({ label, value, valueClass = "text-white", copyable }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyable) return;

    try {
      await navigator.clipboard.writeText(copyable);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="flex justify-between items-center group">
      <span className="text-slate-400 text-sm">{label}:</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${valueClass}`}>{value}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-purple-400 transition-all duration-200 text-xs"
            title="Click to copy full value"
          >
            {copied ? "✓" : "📋"}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Loading skeleton
 */
const LoadingSkeleton: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <LabelHeader
        backText="← Back to Pools"
        onBack={onBack}
        label="Loading..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="w-full h-[400px] bg-slate-800/50 rounded-2xl animate-pulse mb-6"></div>
          <div className="w-full h-[200px] bg-slate-800/50 rounded-2xl animate-pulse"></div>
        </div>
        <div className="lg:col-span-7">
          <div className="w-full h-[300px] bg-slate-800/50 rounded-2xl animate-pulse mb-8"></div>
          <div className="w-full h-[400px] bg-slate-800/50 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Error state
 */
const ErrorState: React.FC<{
  error: string | null;
  onBack: () => void;
  onRetry: () => void;
}> = ({ error, onBack, onRetry }) => (
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
          <button onClick={onRetry} className="btn-prepaid-primary btn-md">
            Try Again
          </button>
          <button onClick={onBack} className="btn-prepaid-outline btn-md">
            Back to Pools
          </button>
        </div>
      </motion.div>
    </div>
  </div>
);

export default PoolDetailsPage;
