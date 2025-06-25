"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePoolDetails } from "@/hooks/use-pool-details";
import PrepaidPoolCard from "./ui/prepaid-pool-card";
import PoolMembersList from "./ui/pool-members-list";
import { LabelHeader } from "./ui/page-header";
import IdentityGenerationFlow from "./identity/identity-generation-flow";
import { PoolCard } from "@/lib/storage/indexed-db-storage";

interface PoolDetailsPageProps {
  poolId: string;
}

// Main pool details page component - UPDATED to include join pool flow
const PoolDetailsPage: React.FC<PoolDetailsPageProps> = ({ poolId }) => {
  const router = useRouter();
  const [showMembers, setShowMembers] = useState(false);
  const [memberLimit, setMemberLimit] = useState(100);
  const [showJoinFlow, setShowJoinFlow] = useState(false);

  // Use the updated hook with member controls
  const { pool, isLoading, error, refetch, members, hasMembers, memberCount } =
    usePoolDetails(poolId, showMembers, memberLimit);

  // Navigation handlers using Next.js router
  const handleBack = () => {
    router.push("/pools");
  };

  const handleJoinPool = () => {
    setShowJoinFlow(true);
  };

  const handleJoinFlowComplete = (card: PoolCard) => {
    setShowJoinFlow(false);
    // Redirect to topup with the new card
    router.push(`/cards/topup?card=${card.id}&pool=${poolId}`);
  };

  const handleJoinFlowCancel = () => {
    setShowJoinFlow(false);
  };

  // Toggle members loading
  const handleToggleMembers = () => {
    setShowMembers(!showMembers);
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
              <button
                onClick={handleBack}
                className="btn-prepaid-outline btn-md"
              >
                Back to Pools
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
        <LabelHeader
          backText="← Back to Pools"
          onBack={() => router.push("/pools")}
          label="Pool Details"
        />

        {/* Pool Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="heading-prepaid-section mb-4">
            <span className="text-prepaid-gradient-white">Pool </span>
            <span className="text-prepaid-gradient-brand">{pool.poolId}</span>
          </h1>
        </motion.div>

        {/* Card Display */}
        <div className="mb-8">
          <PrepaidPoolCard pool={pool} />
        </div>

        {/* NEW: Join Pool Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="card-prepaid-glass card-content-md text-center">
            <div className="text-4xl mb-4">💳</div>
            <h2 className="text-xl font-bold text-white mb-3">
              Ready to Join This Pool?
            </h2>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Get anonymous gas payments by joining Pool {pool.poolId}. You'll
              need to create a secure identity and top up your card.
            </p>

            {/* Pool Info Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-slate-800/30 rounded-lg p-3">
                <div className="text-slate-400 mb-1">Joining Fee</div>
                <div className="text-purple-400 font-bold">
                  {parseFloat(pool.joiningFee).toFixed(4)} ETH
                </div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3">
                <div className="text-slate-400 mb-1">Members</div>
                <div className="text-white font-bold">{pool.membersCount}</div>
              </div>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinPool}
              className="btn-prepaid-primary btn-lg w-full max-w-sm mx-auto"
            >
              Join Pool & Create Gas Card →
            </button>

            <p className="text-xs text-slate-400 mt-3">
              This will create a secure identity and prepare your gas card
            </p>
          </div>
        </motion.div>

        {/* Members Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              Pool Members ({pool.membersCount})
            </h2>

            {/* Members Control */}
            <div className="flex items-center gap-4">
              {showMembers && (
                <select
                  value={memberLimit}
                  onChange={(e) => setMemberLimit(parseInt(e.target.value))}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value={50}>Show 50</option>
                  <option value={100}>Show 100</option>
                  <option value={200}>Show 200</option>
                  <option value={500}>Show 500</option>
                </select>
              )}

              <button
                onClick={handleToggleMembers}
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

          {/* Members List */}
          {showMembers && (
            <PoolMembersList
              members={members}
              isLoading={isLoading}
              poolId={poolId}
            />
          )}

          {/* Members Preview */}
          {!showMembers && (
            <div className="card-prepaid-glass card-content-md text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-bold text-white mb-2">
                {pool.membersCount} Members in Pool
              </h3>
              <p className="text-slate-400 mb-4">
                Click "Show Members" to view identity commitments and join
                history
              </p>
              <button
                onClick={handleToggleMembers}
                className="btn-prepaid-primary btn-md"
              >
                View Members
              </button>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>🔒 All transactions are private and unlinkable</p>
        </div>
      </div>

      {/* NEW: Identity Generation Flow Modal */}
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

export default PoolDetailsPage;
