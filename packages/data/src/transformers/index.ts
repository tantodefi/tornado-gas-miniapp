/**
 * Data transformation utilities
 * Handles conversion between different data representations
 * Updated for new subgraph schema structure
 */

import type {
  PaymasterContract,
  Pool,
  PoolMember,
  MerkleRoot,
  UserOperation,
  RevenueWithdrawal,
  NullifierUsage,
  DailyPoolStats,
  DailyGlobalStats,
} from "../types/subgraph.js";

/**
 * ========================================
 * SERIALIZED TYPE DEFINITIONS
 * ========================================
 */

/**
 * Serialized PaymasterContract (for API responses)
 */
export interface SerializedPaymasterContract {
  id: string;
  contractType: string;
  address: string;
  totalUsersDeposit: string;
  currentDeposit: string;
  revenue: string;
  deployedAtBlock: string;
  deployedAtTransaction: string;
  deployedAtTimestamp: string;
  lastUpdatedBlock: string;
  lastUpdatedTimestamp: string;
  pools: SerializedPool[];
  userOperations: SerializedUserOperation[];
  revenueWithdrawals: SerializedRevenueWithdrawal[];
}

/**
 * Serialized Pool (for API responses)
 */
export interface SerializedPool {
  id: string;
  poolId: string;
  joiningFee: string;
  totalDeposits: string;
  memberCount: string;
  currentMerkleRoot: string;
  currentRootIndex: number;
  rootHistoryCount: number;
  createdAtBlock: string;
  createdAtTransaction: string;
  createdAtTimestamp: string;
  lastUpdatedBlock: string;
  lastUpdatedTimestamp: string;
  paymaster: SerializedPaymasterContract;
  members: SerializedPoolMember[];
  userOperations: SerializedUserOperation[];
  merkleRoots: SerializedMerkleRoot[];
}

/**
 * Serialized PoolMember (for API responses)
 */
export interface SerializedPoolMember {
  id: string;
  memberIndex: string;
  identityCommitment: string;
  merkleRootWhenAdded: string;
  rootIndexWhenAdded: number;
  addedAtBlock: string;
  addedAtTransaction: string;
  addedAtTimestamp: string;
  gasUsed?: string;
  nullifierUsed?: boolean;
  nullifier?: string;
  pool: SerializedPool;
}

/**
 * Serialized MerkleRoot (for API responses)
 */
export interface SerializedMerkleRoot {
  id: string;
  root: string;
  rootIndex: number;
  createdAtBlock: string;
  createdAtTransaction: string;
  createdAtTimestamp: string;
  pool: SerializedPool;
}

/**
 * Serialized UserOperation (for API responses)
 */
export interface SerializedUserOperation {
  id: string;
  userOpHash: string;
  sender: string;
  actualGasCost: string;
  nullifier: string;
  executedAtBlock: string;
  executedAtTransaction: string;
  executedAtTimestamp: string;
  gasPrice?: string;
  totalGasUsed?: string;
  paymaster: SerializedPaymasterContract;
  pool: SerializedPool;
}

/**
 * Serialized RevenueWithdrawal (for API responses)
 */
export interface SerializedRevenueWithdrawal {
  id: string;
  recipient: string;
  amount: string;
  withdrawnAtBlock: string;
  withdrawnAtTransaction: string;
  withdrawnAtTimestamp: string;
  paymaster: SerializedPaymasterContract;
}

/**
 * Serialized NullifierUsage (for API responses)
 */
export interface SerializedNullifierUsage {
  id: string;
  nullifier: string;
  isUsed: boolean;
  gasUsed: string;
  firstUsedAtBlock?: string;
  firstUsedAtTransaction?: string;
  firstUsedAtTimestamp?: string;
  lastUpdatedBlock: string;
  lastUpdatedTimestamp: string;
  paymaster: SerializedPaymasterContract;
  pool: SerializedPool;
  userOperation?: SerializedUserOperation;
}

/**
 * Serialized DailyPoolStats (for API responses)
 */
export interface SerializedDailyPoolStats {
  id: string;
  date: string;
  newMembers: string;
  userOperations: string;
  gasSpent: string;
  revenueGenerated: string;
  totalMembers: string;
  totalDeposits: string;
  pool: SerializedPool;
}

/**
 * Serialized DailyGlobalStats (for API responses)
 */
export interface SerializedDailyGlobalStats {
  id: string;
  date: string;
  newPools: string;
  totalNewMembers: string;
  totalUserOperations: string;
  totalGasSpent: string;
  totalRevenueGenerated: string;
  totalActivePools: string;
  totalMembers: string;
}

/**
 * ========================================
 * SERIALIZATION FUNCTIONS
 * ========================================
 */

/**
 * Serialize PaymasterContract (transform BigInt fields to strings)
 */
export function serializePaymasterContract(
  paymaster: PaymasterContract | Partial<PaymasterContract>,
): SerializedPaymasterContract {
  return {
    id: paymaster.id || "",
    contractType: paymaster.contractType || "",
    address: paymaster.address || "",
    totalUsersDeposit: paymaster.totalUsersDeposit?.toString() || "0",
    currentDeposit: paymaster.currentDeposit?.toString() || "0",
    revenue: paymaster.revenue?.toString() || "0",
    deployedAtBlock: paymaster.deployedAtBlock?.toString() || "0",
    deployedAtTransaction: paymaster.deployedAtTransaction || "",
    deployedAtTimestamp: paymaster.deployedAtTimestamp?.toString() || "0",
    lastUpdatedBlock: paymaster.lastUpdatedBlock?.toString() || "0",
    lastUpdatedTimestamp: paymaster.lastUpdatedTimestamp?.toString() || "0",
    pools: paymaster.pools?.map(serializePool) || [],
    userOperations: paymaster.userOperations?.map(serializeUserOperation) || [],
    revenueWithdrawals:
      paymaster.revenueWithdrawals?.map(serializeRevenueWithdrawal) || [],
  };
}

/**
 * Serialize Pool (transform BigInt fields to strings)
 */
export function serializePool(pool: Pool | Partial<Pool>): SerializedPool {
  return {
    id: pool.id || "",
    poolId: pool.poolId?.toString() || "0",
    joiningFee: pool.joiningFee?.toString() || "0",
    totalDeposits: pool.totalDeposits?.toString() || "0",
    memberCount: pool.memberCount?.toString() || "0",
    currentMerkleRoot: pool.currentMerkleRoot?.toString() || "0",
    currentRootIndex: pool.currentRootIndex || 0,
    rootHistoryCount: pool.rootHistoryCount || 0,
    createdAtBlock: pool.createdAtBlock?.toString() || "0",
    createdAtTransaction: pool.createdAtTransaction || "",
    createdAtTimestamp: pool.createdAtTimestamp?.toString() || "0",
    lastUpdatedBlock: pool.lastUpdatedBlock?.toString() || "0",
    lastUpdatedTimestamp: pool.lastUpdatedTimestamp?.toString() || "0",
    paymaster: pool.paymaster
      ? serializePaymasterContract(pool.paymaster)
      : ({} as SerializedPaymasterContract),
    members: pool.members?.map(serializePoolMember) || [],
    userOperations: pool.userOperations?.map(serializeUserOperation) || [],
    merkleRoots: pool.merkleRoots?.map(serializeMerkleRoot) || [],
  };
}

/**
 * Serialize PoolMember (transform BigInt fields to strings)
 */
export function serializePoolMember(
  member: PoolMember | Partial<PoolMember>,
): SerializedPoolMember {
  return {
    id: member.id || "",
    memberIndex: member.memberIndex?.toString() || "0",
    identityCommitment: member.identityCommitment?.toString() || "0",
    merkleRootWhenAdded: member.merkleRootWhenAdded?.toString() || "0",
    rootIndexWhenAdded: member.rootIndexWhenAdded || 0,
    addedAtBlock: member.addedAtBlock?.toString() || "0",
    addedAtTransaction: member.addedAtTransaction || "",
    addedAtTimestamp: member.addedAtTimestamp?.toString() || "0",
    gasUsed: member.gasUsed?.toString(),
    nullifierUsed: member.nullifierUsed,
    nullifier: member.nullifier?.toString(),
    pool: member.pool ? serializePool(member.pool) : ({} as SerializedPool),
  };
}

/**
 * Serialize MerkleRoot (transform BigInt fields to strings)
 */
export function serializeMerkleRoot(
  merkleRoot: MerkleRoot | Partial<MerkleRoot>,
): SerializedMerkleRoot {
  return {
    id: merkleRoot.id || "",
    root: merkleRoot.root?.toString() || "0",
    rootIndex: merkleRoot.rootIndex || 0,
    createdAtBlock: merkleRoot.createdAtBlock?.toString() || "0",
    createdAtTransaction: merkleRoot.createdAtTransaction || "",
    createdAtTimestamp: merkleRoot.createdAtTimestamp?.toString() || "0",
    pool: merkleRoot.pool
      ? serializePool(merkleRoot.pool)
      : ({} as SerializedPool),
  };
}

/**
 * Serialize UserOperation (transform BigInt fields to strings)
 */
export function serializeUserOperation(
  userOp: UserOperation | Partial<UserOperation>,
): SerializedUserOperation {
  return {
    id: userOp.id || "",
    userOpHash: userOp.userOpHash || "",
    sender: userOp.sender || "",
    actualGasCost: userOp.actualGasCost?.toString() || "0",
    nullifier: userOp.nullifier?.toString() || "0",
    executedAtBlock: userOp.executedAtBlock?.toString() || "0",
    executedAtTransaction: userOp.executedAtTransaction || "",
    executedAtTimestamp: userOp.executedAtTimestamp?.toString() || "0",
    gasPrice: userOp.gasPrice?.toString(),
    totalGasUsed: userOp.totalGasUsed?.toString(),
    paymaster: userOp.paymaster
      ? serializePaymasterContract(userOp.paymaster)
      : ({} as SerializedPaymasterContract),
    pool: userOp.pool ? serializePool(userOp.pool) : ({} as SerializedPool),
  };
}

/**
 * Serialize RevenueWithdrawal (transform BigInt fields to strings)
 */
export function serializeRevenueWithdrawal(
  withdrawal: RevenueWithdrawal | Partial<RevenueWithdrawal>,
): SerializedRevenueWithdrawal {
  return {
    id: withdrawal.id || "",
    recipient: withdrawal.recipient || "",
    amount: withdrawal.amount?.toString() || "0",
    withdrawnAtBlock: withdrawal.withdrawnAtBlock?.toString() || "0",
    withdrawnAtTransaction: withdrawal.withdrawnAtTransaction || "",
    withdrawnAtTimestamp: withdrawal.withdrawnAtTimestamp?.toString() || "0",
    paymaster: withdrawal.paymaster
      ? serializePaymasterContract(withdrawal.paymaster)
      : ({} as SerializedPaymasterContract),
  };
}

/**
 * Serialize NullifierUsage (transform BigInt fields to strings)
 */
export function serializeNullifierUsage(
  nullifierUsage: NullifierUsage | Partial<NullifierUsage>,
): SerializedNullifierUsage {
  return {
    id: nullifierUsage.id || "",
    nullifier: nullifierUsage.nullifier?.toString() || "0",
    isUsed: nullifierUsage.isUsed || false,
    gasUsed: nullifierUsage.gasUsed?.toString() || "0",
    firstUsedAtBlock: nullifierUsage.firstUsedAtBlock?.toString(),
    firstUsedAtTransaction: nullifierUsage.firstUsedAtTransaction,
    firstUsedAtTimestamp: nullifierUsage.firstUsedAtTimestamp?.toString(),
    lastUpdatedBlock: nullifierUsage.lastUpdatedBlock?.toString() || "0",
    lastUpdatedTimestamp:
      nullifierUsage.lastUpdatedTimestamp?.toString() || "0",
    paymaster: nullifierUsage.paymaster
      ? serializePaymasterContract(nullifierUsage.paymaster)
      : ({} as SerializedPaymasterContract),
    pool: nullifierUsage.pool
      ? serializePool(nullifierUsage.pool)
      : ({} as SerializedPool),
    userOperation: nullifierUsage.userOperation
      ? serializeUserOperation(nullifierUsage.userOperation)
      : undefined,
  };
}

/**
 * Serialize DailyPoolStats (transform BigInt fields to strings)
 */
export function serializeDailyPoolStats(
  stats: DailyPoolStats | Partial<DailyPoolStats>,
): SerializedDailyPoolStats {
  return {
    id: stats.id || "",
    date: stats.date || "",
    newMembers: stats.newMembers?.toString() || "0",
    userOperations: stats.userOperations?.toString() || "0",
    gasSpent: stats.gasSpent?.toString() || "0",
    revenueGenerated: stats.revenueGenerated?.toString() || "0",
    totalMembers: stats.totalMembers?.toString() || "0",
    totalDeposits: stats.totalDeposits?.toString() || "0",
    pool: stats.pool ? serializePool(stats.pool) : ({} as SerializedPool),
  };
}

/**
 * Serialize DailyGlobalStats (transform BigInt fields to strings)
 */
export function serializeDailyGlobalStats(
  stats: DailyGlobalStats | Partial<DailyGlobalStats>,
): SerializedDailyGlobalStats {
  return {
    id: stats.id || "",
    date: stats.date || "",
    newPools: stats.newPools?.toString() || "0",
    totalNewMembers: stats.totalNewMembers?.toString() || "0",
    totalUserOperations: stats.totalUserOperations?.toString() || "0",
    totalGasSpent: stats.totalGasSpent?.toString() || "0",
    totalRevenueGenerated: stats.totalRevenueGenerated?.toString() || "0",
    totalActivePools: stats.totalActivePools?.toString() || "0",
    totalMembers: stats.totalMembers?.toString() || "0",
  };
}

/**
 * ========================================
 * DESERIALIZATION FUNCTIONS
 * ========================================
 */

/**
 * Deserialize PaymasterContract (transform string fields back to BigInt)
 */
export function deserializePaymasterContract(
  serialized: SerializedPaymasterContract,
): PaymasterContract {
  return {
    id: serialized.id,
    contractType: serialized.contractType,
    address: serialized.address,
    totalUsersDeposit: BigInt(serialized.totalUsersDeposit),
    currentDeposit: BigInt(serialized.currentDeposit),
    revenue: BigInt(serialized.revenue),
    deployedAtBlock: BigInt(serialized.deployedAtBlock),
    deployedAtTransaction: serialized.deployedAtTransaction,
    deployedAtTimestamp: BigInt(serialized.deployedAtTimestamp),
    lastUpdatedBlock: BigInt(serialized.lastUpdatedBlock),
    lastUpdatedTimestamp: BigInt(serialized.lastUpdatedTimestamp),
    pools: serialized.pools?.map(deserializePool) || [],
    userOperations:
      serialized.userOperations?.map(deserializeUserOperation) || [],
    revenueWithdrawals:
      serialized.revenueWithdrawals?.map(deserializeRevenueWithdrawal) || [],
  };
}

/**
 * Deserialize Pool (transform string fields back to BigInt)
 */
export function deserializePool(serialized: SerializedPool): Pool {
  return {
    id: serialized.id,
    poolId: BigInt(serialized.poolId),
    joiningFee: BigInt(serialized.joiningFee),
    totalDeposits: BigInt(serialized.totalDeposits),
    memberCount: BigInt(serialized.memberCount),
    currentMerkleRoot: BigInt(serialized.currentMerkleRoot),
    currentRootIndex: serialized.currentRootIndex,
    rootHistoryCount: serialized.rootHistoryCount,
    createdAtBlock: BigInt(serialized.createdAtBlock),
    createdAtTransaction: serialized.createdAtTransaction,
    createdAtTimestamp: BigInt(serialized.createdAtTimestamp),
    lastUpdatedBlock: BigInt(serialized.lastUpdatedBlock),
    lastUpdatedTimestamp: BigInt(serialized.lastUpdatedTimestamp),
    paymaster: deserializePaymasterContract(serialized.paymaster),
    members: serialized.members?.map(deserializePoolMember) || [],
    userOperations:
      serialized.userOperations?.map(deserializeUserOperation) || [],
    merkleRoots: serialized.merkleRoots?.map(deserializeMerkleRoot) || [],
  };
}

/**
 * Deserialize PoolMember (transform string fields back to BigInt)
 */
export function deserializePoolMember(
  serialized: SerializedPoolMember,
): PoolMember {
  return {
    id: serialized.id,
    memberIndex: BigInt(serialized.memberIndex),
    identityCommitment: BigInt(serialized.identityCommitment),
    merkleRootWhenAdded: BigInt(serialized.merkleRootWhenAdded),
    rootIndexWhenAdded: serialized.rootIndexWhenAdded,
    addedAtBlock: BigInt(serialized.addedAtBlock),
    addedAtTransaction: serialized.addedAtTransaction,
    addedAtTimestamp: BigInt(serialized.addedAtTimestamp),
    gasUsed: serialized.gasUsed ? BigInt(serialized.gasUsed) : undefined,
    nullifierUsed: serialized.nullifierUsed,
    nullifier: serialized.nullifier ? BigInt(serialized.nullifier) : undefined,
    pool: deserializePool(serialized.pool),
  };
}

/**
 * Deserialize MerkleRoot (transform string fields back to BigInt)
 */
export function deserializeMerkleRoot(
  serialized: SerializedMerkleRoot,
): MerkleRoot {
  return {
    id: serialized.id,
    root: BigInt(serialized.root),
    rootIndex: serialized.rootIndex,
    createdAtBlock: BigInt(serialized.createdAtBlock),
    createdAtTransaction: serialized.createdAtTransaction,
    createdAtTimestamp: BigInt(serialized.createdAtTimestamp),
    pool: deserializePool(serialized.pool),
  };
}

/**
 * Deserialize UserOperation (transform string fields back to BigInt)
 */
export function deserializeUserOperation(
  serialized: SerializedUserOperation,
): UserOperation {
  return {
    id: serialized.id,
    userOpHash: serialized.userOpHash,
    sender: serialized.sender,
    actualGasCost: BigInt(serialized.actualGasCost),
    nullifier: BigInt(serialized.nullifier),
    executedAtBlock: BigInt(serialized.executedAtBlock),
    executedAtTransaction: serialized.executedAtTransaction,
    executedAtTimestamp: BigInt(serialized.executedAtTimestamp),
    gasPrice: serialized.gasPrice ? BigInt(serialized.gasPrice) : undefined,
    totalGasUsed: serialized.totalGasUsed
      ? BigInt(serialized.totalGasUsed)
      : undefined,
    paymaster: deserializePaymasterContract(serialized.paymaster),
    pool: deserializePool(serialized.pool),
  };
}

/**
 * Deserialize RevenueWithdrawal (transform string fields back to BigInt)
 */
export function deserializeRevenueWithdrawal(
  serialized: SerializedRevenueWithdrawal,
): RevenueWithdrawal {
  return {
    id: serialized.id,
    recipient: serialized.recipient,
    amount: BigInt(serialized.amount),
    withdrawnAtBlock: BigInt(serialized.withdrawnAtBlock),
    withdrawnAtTransaction: serialized.withdrawnAtTransaction,
    withdrawnAtTimestamp: BigInt(serialized.withdrawnAtTimestamp),
    paymaster: deserializePaymasterContract(serialized.paymaster),
  };
}

/**
 * Deserialize NullifierUsage (transform string fields back to BigInt)
 */
export function deserializeNullifierUsage(
  serialized: SerializedNullifierUsage,
): NullifierUsage {
  return {
    id: serialized.id,
    nullifier: BigInt(serialized.nullifier),
    isUsed: serialized.isUsed,
    gasUsed: BigInt(serialized.gasUsed),
    firstUsedAtBlock: serialized.firstUsedAtBlock
      ? BigInt(serialized.firstUsedAtBlock)
      : undefined,
    firstUsedAtTransaction: serialized.firstUsedAtTransaction,
    firstUsedAtTimestamp: serialized.firstUsedAtTimestamp
      ? BigInt(serialized.firstUsedAtTimestamp)
      : undefined,
    lastUpdatedBlock: BigInt(serialized.lastUpdatedBlock),
    lastUpdatedTimestamp: BigInt(serialized.lastUpdatedTimestamp),
    paymaster: deserializePaymasterContract(serialized.paymaster),
    pool: deserializePool(serialized.pool),
    userOperation: serialized.userOperation
      ? deserializeUserOperation(serialized.userOperation)
      : undefined,
  };
}

/**
 * Deserialize DailyPoolStats (transform string fields back to BigInt)
 */
export function deserializeDailyPoolStats(
  serialized: SerializedDailyPoolStats,
): DailyPoolStats {
  return {
    id: serialized.id,
    date: serialized.date,
    newMembers: BigInt(serialized.newMembers),
    userOperations: BigInt(serialized.userOperations),
    gasSpent: BigInt(serialized.gasSpent),
    revenueGenerated: BigInt(serialized.revenueGenerated),
    totalMembers: BigInt(serialized.totalMembers),
    totalDeposits: BigInt(serialized.totalDeposits),
    pool: deserializePool(serialized.pool),
  };
}

/**
 * Deserialize DailyGlobalStats (transform string fields back to BigInt)
 */
export function deserializeDailyGlobalStats(
  serialized: SerializedDailyGlobalStats,
): DailyGlobalStats {
  return {
    id: serialized.id,
    date: serialized.date,
    newPools: BigInt(serialized.newPools),
    totalNewMembers: BigInt(serialized.totalNewMembers),
    totalUserOperations: BigInt(serialized.totalUserOperations),
    totalGasSpent: BigInt(serialized.totalGasSpent),
    totalRevenueGenerated: BigInt(serialized.totalRevenueGenerated),
    totalActivePools: BigInt(serialized.totalActivePools),
    totalMembers: BigInt(serialized.totalMembers),
  };
}

/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 */

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

/**
 * Utility: Format gas values for display
 */
export function formatGasValue(gasValue: bigint): string {
  if (gasValue === 0n) {
    return "0";
  }

  // Format with commas for readability
  return gasValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Utility: Format currency values (wei to ETH with symbol)
 */
export function formatCurrencyValue(
  value: bigint,
  decimals: number = 18,
  precision: number = 4,
  symbol: string = "ETH",
): string {
  const formatted = formatBigIntValue(value, decimals, precision);
  return `${formatted} ${symbol}`;
}

/**
 * Utility: Calculate percentage change
 */
export function calculatePercentageChange(
  current: bigint,
  previous: bigint,
): string {
  if (previous === 0n) {
    return current > 0n ? "+∞%" : "0%";
  }

  const change = current - previous;
  const percentage = (Number(change) / Number(previous)) * 100;

  const sign = percentage > 0 ? "+" : "";
  return `${sign}${percentage.toFixed(2)}%`;
}

/**
 * Utility: Format timestamp to human-readable date
 */
export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  const isoString = date.toISOString();
  const datePart = isoString.split("T")[0];
  return datePart ?? isoString; // YYYY-MM-DD format
}

/**
 * Utility: Format timestamp to human-readable date and time
 */
export function formatTimestampWithTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toISOString().replace("T", " ").replace("Z", "");
}
