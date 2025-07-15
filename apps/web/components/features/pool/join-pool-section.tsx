//file:prepaid-gas-website/apps/web/components/features/pools/join-pool-section.tsx

"use client";

import React from "react";
import MultiUsePoolCard from "../../shared/multi-use-pool-card";
import SingleUsePoolCard from "@/components/shared/single-use-pool-card";
import { SerializedPool } from "@prepaid-gas/data";

interface JoinPoolSectionProps {
  pool: SerializedPool;
  onJoin: () => void;
  buttonText: string;
  buttonDisabled: boolean;
}

/**
 * Join Pool Section Component
 * Single responsibility: Display pool card and join button
 */
function JoinPoolSection({
  pool,
  onJoin,
  buttonText,
  buttonDisabled,
}: JoinPoolSectionProps) {
  return (
    <div className="card-prepaid-glass card-content-lg overflow-hidden">
      {/* Pool Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-mono mb-3">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
          Pool {pool.poolId}
        </div>
      </div>

      {/* Visual Pool Card */}
      {pool.paymaster.contractType === "GasLimited" ? (
        <MultiUsePoolCard pool={pool} />
      ) : (
        <SingleUsePoolCard pool={pool} />
      )}

      {/* Join Action */}
      <div className="text-center">
        <button
          onClick={onJoin}
          disabled={buttonDisabled}
          className={`btn-prepaid-primary btn-md my-3 ${
            buttonDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default JoinPoolSection;
