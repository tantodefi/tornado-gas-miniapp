"use client";

import React from "react";
import PrepaidPoolCard from "../ui/prepaid-pool-card";

/**
 * Interface for pool data needed by the card (matches PrepaidPoolCard requirements)
 */
interface PoolData {
  id: string;
  poolId: string;
  joiningFee: string;
  merkleTreeDuration: string;
  totalDeposits: string;
  currentMerkleTreeRoot: string;
  membersCount: string;
  merkleTreeDepth: string;
  createdAt: string;
  createdAtBlock: string;
  currentRootIndex: number;
  rootHistoryCount: number;
  network: {
    name: string;
    chainId: number;
    chainName: string;
    networkName: string;
    contracts: {
      paymaster: string;
      verifier?: string;
    };
  };
}

/**
 * Props for EnhancedPoolCard component
 */
interface EnhancedPoolCardProps {
  /** Pool data to display */
  pool: PoolData;
  /** Handler for join button click */
  onJoin: () => void;
  /** Whether identity generation is in progress */
  isJoining: boolean;
  /** Whether payment modal is shown */
  showPayment: boolean;
}

/**
 * Format wei amount to ETH display
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
 * Enhanced Pool Card Component
 *
 * Single Responsibility: Display pool card with join functionality and state management
 *
 * Features:
 * - Shows pool header with ID and status
 * - Displays visual pool card
 * - Handles join button with different states
 * - Shows appropriate descriptions for each state
 */
const EnhancedPoolCard: React.FC<EnhancedPoolCardProps> = ({
  pool,
  onJoin,
  isJoining,
  showPayment,
}) => {
  const joiningFeeEth = formatEthAmount(pool.joiningFee);

  // Determine button state and text
  const getButtonState = () => {
    if (showPayment) {
      return {
        text: "Payment in Progress...",
        disabled: true,
        description: "Complete your payment to activate the gas card",
      };
    }

    if (isJoining) {
      return {
        text: "Creating Gas Card...",
        disabled: true,
        description: "Generating secure identity and preparing payment...",
      };
    }

    return {
      text: "Join Pool →",
      disabled: false,
      description: "Creates your gas card and takes you to payment",
    };
  };

  const buttonState = getButtonState();

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
        <button
          onClick={onJoin}
          disabled={buttonState.disabled}
          className={`btn-prepaid-primary btn-md my-3 ${
            buttonState.disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {buttonState.text}
        </button>
        <p className="text-xs text-slate-400">{buttonState.description}</p>
      </div>
    </div>
  );
};

export default EnhancedPoolCard;
