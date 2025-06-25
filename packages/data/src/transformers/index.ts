/**
 * Data transformation utilities
 * Handles conversion between different data representations
 */

import type { Pool, PoolMember, MerkleRootHistory } from "../types/subgraph.js";

/**
 * Serialized versions of subgraph types (for API responses)
 */
export interface SerializedPool {
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
  members: SerializedPoolMember[];
  rootHistory: SerializedMerkleRootHistory[];
}

export interface SerializedPoolMember {
  id: string;
  identityCommitment: string;
  memberIndex: string;
  joinedAt: string;
  joinedAtBlock: string;
  isActive: boolean;
}

export interface SerializedMerkleRootHistory {
  id: string;
  index: number;
  merkleRoot: string;
  createdAt: string;
  createdAtBlock: string;
  isValid: boolean;
  transactionHash: string;
}

/**
 * Transform BigInt fields to strings for JSON serialization
 * Handles partial Pool objects safely
 */
export function serializePool(pool: Pool | Partial<Pool>): SerializedPool {
  return {
    id: pool.id || "",
    poolId: pool.poolId?.toString() || "0",
    joiningFee: pool.joiningFee?.toString() || "0",
    merkleTreeDuration: pool.merkleTreeDuration?.toString() || "0",
    totalDeposits: pool.totalDeposits?.toString() || "0",
    currentMerkleTreeRoot: pool.currentMerkleTreeRoot?.toString() || "0",
    membersCount: pool.membersCount?.toString() || "0",
    merkleTreeDepth: pool.merkleTreeDepth?.toString() || "0",
    createdAt: pool.createdAt?.toString() || "0",
    createdAtBlock: pool.createdAtBlock?.toString() || "0",
    currentRootIndex: pool.currentRootIndex || 0,
    rootHistoryCount: pool.rootHistoryCount || 0,
    members: pool.members?.map(serializePoolMember) || [],
    rootHistory: pool.rootHistory?.map(serializeMerkleRootHistory) || [],
  };
}

/**
 * Transform string fields back to BigInt from JSON
 */
export function deserializePool(serialized: SerializedPool): Pool {
  return {
    id: serialized.id,
    poolId: BigInt(serialized.poolId),
    joiningFee: BigInt(serialized.joiningFee),
    merkleTreeDuration: BigInt(serialized.merkleTreeDuration),
    totalDeposits: BigInt(serialized.totalDeposits),
    currentMerkleTreeRoot: BigInt(serialized.currentMerkleTreeRoot),
    membersCount: BigInt(serialized.membersCount),
    merkleTreeDepth: BigInt(serialized.merkleTreeDepth),
    createdAt: BigInt(serialized.createdAt),
    createdAtBlock: BigInt(serialized.createdAtBlock),
    currentRootIndex: serialized.currentRootIndex,
    rootHistoryCount: serialized.rootHistoryCount,
    members: serialized.members?.map(deserializePoolMember) || [],
    rootHistory:
      serialized.rootHistory?.map(deserializeMerkleRootHistory) || [],
  };
}

/**
 * Serialize pool member (no BigInt fields, so pass-through)
 */
export function serializePoolMember(member: PoolMember): SerializedPoolMember {
  return {
    id: member.id,
    identityCommitment: member.identityCommitment,
    memberIndex: member.memberIndex,
    joinedAt: member.joinedAt,
    joinedAtBlock: member.joinedAtBlock,
    isActive: member.isActive,
  };
}

/**
 * Deserialize pool member (no BigInt fields, so pass-through)
 */
export function deserializePoolMember(
  serialized: SerializedPoolMember,
): PoolMember {
  // Note: pool reference will need to be handled separately
  return {
    id: serialized.id,
    identityCommitment: serialized.identityCommitment,
    memberIndex: serialized.memberIndex,
    joinedAt: serialized.joinedAt,
    joinedAtBlock: serialized.joinedAtBlock,
    isActive: serialized.isActive,
    pool: {} as Pool, // Will be filled by calling code
  };
}

/**
 * Serialize merkle root history
 */
export function serializeMerkleRootHistory(
  history: MerkleRootHistory,
): SerializedMerkleRootHistory {
  return {
    id: history.id,
    index: history.index,
    merkleRoot: history.merkleRoot.toString(),
    createdAt: history.createdAt.toString(),
    createdAtBlock: history.createdAtBlock.toString(),
    isValid: history.isValid,
    transactionHash: history.transactionHash,
  };
}

/**
 * Deserialize merkle root history
 */
export function deserializeMerkleRootHistory(
  serialized: SerializedMerkleRootHistory,
): MerkleRootHistory {
  return {
    id: serialized.id,
    index: serialized.index,
    merkleRoot: BigInt(serialized.merkleRoot),
    createdAt: BigInt(serialized.createdAt),
    createdAtBlock: BigInt(serialized.createdAtBlock),
    isValid: serialized.isValid,
    transactionHash: serialized.transactionHash,
    pool: {} as Pool, // Will be filled by calling code
  };
}

/**
 * Utility: Safe BigInt conversion with error handling
 */
export function safeBigIntParse(value: string | number | bigint): bigint {
  try {
    return BigInt(value);
  } catch (error) {
    throw new Error(`Invalid BigInt value: ${value}`);
  }
}

/**
 * Utility: Check if a value looks like a valid BigInt string
 */
export function isValidBigIntString(value: string): boolean {
  try {
    BigInt(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Utility: Format BigInt values for display (e.g., wei to ETH)
 */
export function formatBigIntValue(
  value: bigint,
  decimals: number = 18,
  precision: number = 4,
): string {
  const divisor = BigInt(10 ** decimals);
  const quotient = value / divisor;
  const remainder = value % divisor;

  if (remainder === 0n) {
    return quotient.toString();
  }

  const decimalPart = remainder.toString().padStart(decimals, "0");
  const trimmed = decimalPart.slice(0, precision).replace(/0+$/, "");

  return trimmed ? `${quotient}.${trimmed}` : quotient.toString();
}
