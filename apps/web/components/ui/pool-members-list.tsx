"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { PoolMember } from "@/hooks/use-pool-details";

interface PoolMembersListProps {
  members: PoolMember[];
  isLoading?: boolean;
  poolId: string;
}

/**
 * Pool Members List Component
 * Displays list of pool members with their identity commitments
 */
const PoolMembersList: React.FC<PoolMembersListProps> = ({
  members,
  isLoading = false,
  poolId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCommitment, setCopiedCommitment] = useState<string | null>(null);

  // Filter members based on search term
  const filteredMembers = members.filter(
    (member) =>
      member.identityCommitment
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.memberIndex.includes(searchTerm),
  );

  // Copy to clipboard function
  const copyToClipboard = async (text: string, commitmentId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommitment(commitmentId);
      setTimeout(() => setCopiedCommitment(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Format identity commitment for display
  const formatCommitment = (commitment: string) => {
    if (commitment.length <= 16) return commitment;
    return `${commitment.slice(0, 8)}...${commitment.slice(-8)}`;
  };

  // Format date
  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="card-prepaid-glass card-content-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-32"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-slate-700/50 rounded w-48"></div>
              <div className="h-4 bg-slate-700/50 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="card-prepaid-glass card-content-md text-center">
        <div className="text-4xl mb-4">👥</div>
        <h3 className="text-lg font-bold text-white mb-2">No Members Found</h3>
        <p className="text-slate-400">
          This pool doesn't have any active members yet.
        </p>
      </div>
    );
  }

  return (
    <div className="card-prepaid-glass card-content-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">
          Pool Members ({members.length})
        </h3>
        {members.length > 5 && (
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
          />
        )}
      </div>

      {/* Members List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-600/20 hover:border-purple-500/30 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {/* Member Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                  #{member.memberIndex}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(member.identityCommitment, member.id)
                  }
                  className="font-mono text-sm text-white hover:text-purple-400 transition-colors cursor-pointer"
                  title="Click to copy full commitment"
                >
                  {formatCommitment(member.identityCommitment)}
                  {copiedCommitment === member.id && (
                    <span className="text-green-400 ml-2">✓ Copied</span>
                  )}
                </button>
              </div>
              <div className="text-xs text-slate-400">
                Joined: {formatDate(member.joinedAt)}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  member.isActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  member.isActive ? "text-green-400" : "text-red-400"
                }`}
              >
                {member.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search Results Info */}
      {searchTerm && filteredMembers.length !== members.length && (
        <div className="mt-4 text-center text-sm text-slate-400">
          Showing {filteredMembers.length} of {members.length} members
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-600/30 text-center">
        <p className="text-xs text-slate-400">
          🔒 Identity commitments are anonymized. Pool ID: {poolId}
        </p>
      </div>
    </div>
  );
};

export default PoolMembersList;
