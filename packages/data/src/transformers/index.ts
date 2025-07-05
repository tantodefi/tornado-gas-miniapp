/**
 * Data transformers for the prepaid gas paymaster system
 * Updated for the new network-aware schema structure
 *
 * Handles BigInt serialization/deserialization and provides utility functions
 * for formatting blockchain data for API responses and client consumption.
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
  NetworkInfo,
  SerializedPaymasterContract,
  SerializedPool,
  SerializedPoolMember,
  SerializedMerkleRoot,
  SerializedUserOperation,
  SerializedRevenueWithdrawal,
  SerializedNullifierUsage,
  SerializedDailyPoolStats,
  SerializedDailyGlobalStats,
  SerializedNetworkInfo,
} from "../types/subgraph.js";

/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 */

/**
 * Safely parse a BigInt from a string
 *
 * @param value - String value to parse
 * @returns BigInt value or 0n if invalid
 */
export function safeBigIntParse(value: string | number | bigint): bigint {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    return BigInt(Math.floor(value));
  }

  try {
    return BigInt(value);
  } catch (error) {
    console.warn(`Failed to parse BigInt from value: ${value}`, error);
    return 0n;
  }
}

/**
 * Check if a string is a valid BigInt
 *
 * @param value - String to validate
 * @returns True if valid BigInt string
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
 * Format a BigInt value for display
 *
 * @param value - BigInt value
 * @param decimals - Number of decimals to show
 * @returns Formatted string
 */
export function formatBigIntValue(value: bigint, decimals: number = 4): string {
  if (value === 0n) return "0";

  const valueStr = value.toString();
  if (valueStr.length <= decimals) {
    return `0.${"0".repeat(decimals - valueStr.length)}${valueStr}`;
  }

  const intPart = valueStr.slice(0, -decimals);
  const decPart = valueStr.slice(-decimals);

  return `${intPart}.${decPart}`;
}

/**
 * Format gas values (wei to ETH)
 *
 * @param gasValue - Gas value in wei
 * @param decimals - Number of decimals to show
 * @returns Formatted ETH string
 */
export function formatGasValue(gasValue: bigint, decimals: number = 6): string {
  const ethValue = gasValue * 10n ** 12n; // Convert wei to ETH (18 decimals)
  return formatBigIntValue(ethValue, 18).substring(0, decimals + 2);
}

/**
 * Format currency values (wei to ETH)
 *
 * @param value - Value in wei
 * @param symbol - Currency symbol
 * @param decimals - Number of decimals to show
 * @returns Formatted currency string
 */
export function formatCurrencyValue(
  value: bigint,
  symbol: string = "ETH",
  decimals: number = 6,
): string {
  const ethValue = Number(value) / 10 ** 18;
  return `${ethValue.toFixed(decimals)} ${symbol}`;
}

/**
 * Calculate percentage change
 *
 * @param oldValue - Previous value
 * @param newValue - Current value
 * @returns Percentage change
 */
export function calculatePercentageChange(
  oldValue: bigint,
  newValue: bigint,
): number {
  if (oldValue === 0n) return newValue > 0n ? 100 : 0;

  const change = newValue - oldValue;
  const percentage = (Number(change) / Number(oldValue)) * 100;

  return Math.round(percentage * 100) / 100;
}

/**
 * Format timestamp to human-readable date
 *
 * @param timestamp - Unix timestamp
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: bigint | string): string {
  const ts =
    typeof timestamp === "string" ? parseInt(timestamp) : Number(timestamp);
  return new Date(ts * 1000).toLocaleDateString();
}

/**
 * Format timestamp to human-readable date with time
 *
 * @param timestamp - Unix timestamp
 * @returns Formatted date and time string
 */
export function formatTimestampWithTime(timestamp: bigint | string): string {
  const ts =
    typeof timestamp === "string" ? parseInt(timestamp) : Number(timestamp);
  return new Date(ts * 1000).toLocaleString();
}

/**
 * ========================================
 * PAYMASTER CONTRACT TRANSFORMERS
 * ========================================
 */

/**
 * Serialize PaymasterContract (BigInt -> string)
 *
 * @param paymaster - PaymasterContract entity
 * @returns Serialized paymaster contract
 */
export function serializePaymasterContract(
  paymaster: PaymasterContract,
): SerializedPaymasterContract {
  return {
    id: paymaster.id,
    contractType: paymaster.contractType,
    address: paymaster.address,
    network: paymaster.network,
    chainId: paymaster.chainId.toString(),
    totalUsersDeposit: paymaster.totalUsersDeposit.toString(),
    currentDeposit: paymaster.currentDeposit.toString(),
    revenue: paymaster.revenue.toString(),
    deployedAtBlock: paymaster.deployedAtBlock.toString(),
    deployedAtTransaction: paymaster.deployedAtTransaction,
    deployedAtTimestamp: paymaster.deployedAtTimestamp.toString(),
    pools: paymaster.pools.map(serializePool),
    userOperations: paymaster.userOperations.map(serializeUserOperation),
    revenueWithdrawals: paymaster.revenueWithdrawals.map(
      serializeRevenueWithdrawal,
    ),
    lastUpdatedBlock: paymaster.lastUpdatedBlock.toString(),
    lastUpdatedTimestamp: paymaster.lastUpdatedTimestamp.toString(),
  };
}

/**
 * Deserialize PaymasterContract (string -> BigInt)
 *
 * @param serialized - Serialized paymaster contract
 * @returns PaymasterContract entity
 */
export function deserializePaymasterContract(
  serialized: SerializedPaymasterContract,
): PaymasterContract {
  return {
    id: serialized.id,
    contractType: serialized.contractType,
    address: serialized.address,
    network: serialized.network,
    chainId: safeBigIntParse(serialized.chainId),
    totalUsersDeposit: safeBigIntParse(serialized.totalUsersDeposit),
    currentDeposit: safeBigIntParse(serialized.currentDeposit),
    revenue: safeBigIntParse(serialized.revenue),
    deployedAtBlock: safeBigIntParse(serialized.deployedAtBlock),
    deployedAtTransaction: serialized.deployedAtTransaction,
    deployedAtTimestamp: safeBigIntParse(serialized.deployedAtTimestamp),
    pools: serialized.pools.map(deserializePool),
    userOperations: serialized.userOperations.map(deserializeUserOperation),
    revenueWithdrawals: serialized.revenueWithdrawals.map(
      deserializeRevenueWithdrawal,
    ),
    lastUpdatedBlock: safeBigIntParse(serialized.lastUpdatedBlock),
    lastUpdatedTimestamp: safeBigIntParse(serialized.lastUpdatedTimestamp),
  };
}

/**
 * ========================================
 * POOL TRANSFORMERS
 * ========================================
 */

/**
 * Serialize Pool (BigInt -> string)
 *
 * @param pool - Pool entity
 * @returns Serialized pool
 */
export function serializePool(pool: Pool): SerializedPool {
  return {
    id: pool.id,
    poolId: pool.poolId.toString(),
    paymaster: serializePaymasterContract(pool.paymaster),
    network: pool.network,
    chainId: pool.chainId.toString(),
    joiningFee: pool.joiningFee.toString(),
    totalDeposits: pool.totalDeposits.toString(),
    memberCount: pool.memberCount.toString(),
    currentMerkleRoot: pool.currentMerkleRoot.toString(),
    currentRootIndex: pool.currentRootIndex,
    rootHistoryCount: pool.rootHistoryCount,
    createdAtBlock: pool.createdAtBlock.toString(),
    createdAtTransaction: pool.createdAtTransaction,
    createdAtTimestamp: pool.createdAtTimestamp.toString(),
    members: pool.members.map(serializePoolMember),
    userOperations: pool.userOperations.map(serializeUserOperation),
    merkleRoots: pool.merkleRoots.map(serializeMerkleRoot),
    lastUpdatedBlock: pool.lastUpdatedBlock.toString(),
    lastUpdatedTimestamp: pool.lastUpdatedTimestamp.toString(),
  };
}

/**
 * Deserialize Pool (string -> BigInt)
 *
 * @param serialized - Serialized pool
 * @returns Pool entity
 */
export function deserializePool(serialized: SerializedPool): Pool {
  return {
    id: serialized.id,
    poolId: safeBigIntParse(serialized.poolId),
    paymaster: deserializePaymasterContract(serialized.paymaster),
    network: serialized.network,
    chainId: safeBigIntParse(serialized.chainId),
    joiningFee: safeBigIntParse(serialized.joiningFee),
    totalDeposits: safeBigIntParse(serialized.totalDeposits),
    memberCount: safeBigIntParse(serialized.memberCount),
    currentMerkleRoot: safeBigIntParse(serialized.currentMerkleRoot),
    currentRootIndex: serialized.currentRootIndex,
    rootHistoryCount: serialized.rootHistoryCount,
    createdAtBlock: safeBigIntParse(serialized.createdAtBlock),
    createdAtTransaction: serialized.createdAtTransaction,
    createdAtTimestamp: safeBigIntParse(serialized.createdAtTimestamp),
    members: serialized.members.map(deserializePoolMember),
    userOperations: serialized.userOperations.map(deserializeUserOperation),
    merkleRoots: serialized.merkleRoots.map(deserializeMerkleRoot),
    lastUpdatedBlock: safeBigIntParse(serialized.lastUpdatedBlock),
    lastUpdatedTimestamp: safeBigIntParse(serialized.lastUpdatedTimestamp),
  };
}

/**
 * ========================================
 * POOL MEMBER TRANSFORMERS
 * ========================================
 */

/**
 * Serialize PoolMember (BigInt -> string)
 *
 * @param member - PoolMember entity
 * @returns Serialized pool member
 */
export function serializePoolMember(member: PoolMember): SerializedPoolMember {
  return {
    id: member.id,
    pool: serializePool(member.pool),
    network: member.network,
    chainId: member.chainId.toString(),
    memberIndex: member.memberIndex.toString(),
    identityCommitment: member.identityCommitment.toString(),
    merkleRootWhenAdded: member.merkleRootWhenAdded.toString(),
    rootIndexWhenAdded: member.rootIndexWhenAdded,
    addedAtBlock: member.addedAtBlock.toString(),
    addedAtTransaction: member.addedAtTransaction,
    addedAtTimestamp: member.addedAtTimestamp.toString(),
    gasUsed: member.gasUsed?.toString(),
    nullifierUsed: member.nullifierUsed,
    nullifier: member.nullifier?.toString(),
  };
}

/**
 * Deserialize PoolMember (string -> BigInt)
 *
 * @param serialized - Serialized pool member
 * @returns PoolMember entity
 */
export function deserializePoolMember(
  serialized: SerializedPoolMember,
): PoolMember {
  return {
    id: serialized.id,
    pool: deserializePool(serialized.pool),
    network: serialized.network,
    chainId: safeBigIntParse(serialized.chainId),
    memberIndex: safeBigIntParse(serialized.memberIndex),
    identityCommitment: safeBigIntParse(serialized.identityCommitment),
    merkleRootWhenAdded: safeBigIntParse(serialized.merkleRootWhenAdded),
    rootIndexWhenAdded: serialized.rootIndexWhenAdded,
    addedAtBlock: safeBigIntParse(serialized.addedAtBlock),
    addedAtTransaction: serialized.addedAtTransaction,
    addedAtTimestamp: safeBigIntParse(serialized.addedAtTimestamp),
    gasUsed: serialized.gasUsed
      ? safeBigIntParse(serialized.gasUsed)
      : undefined,
    nullifierUsed: serialized.nullifierUsed,
    nullifier: serialized.nullifier
      ? safeBigIntParse(serialized.nullifier)
      : undefined,
  };
}

/**
 * ========================================
 * MERKLE ROOT TRANSFORMERS
 * ========================================
 */

/**
 * Serialize MerkleRoot (BigInt -> string)
 *
 * @param merkleRoot - MerkleRoot entity
 * @returns Serialized merkle root
 */
export function serializeMerkleRoot(
  merkleRoot: MerkleRoot,
): SerializedMerkleRoot {
  return {
    id: merkleRoot.id,
    pool: serializePool(merkleRoot.pool),
    network: merkleRoot.network,
    chainId: merkleRoot.chainId.toString(),
    root: merkleRoot.root.toString(),
    rootIndex: merkleRoot.rootIndex,
    createdAtBlock: merkleRoot.createdAtBlock.toString(),
    createdAtTransaction: merkleRoot.createdAtTransaction,
    createdAtTimestamp: merkleRoot.createdAtTimestamp.toString(),
  };
}

/**
 * Deserialize MerkleRoot (string -> BigInt)
 *
 * @param serialized - Serialized merkle root
 * @returns MerkleRoot entity
 */
export function deserializeMerkleRoot(
  serialized: SerializedMerkleRoot,
): MerkleRoot {
  return {
    id: serialized.id,
    pool: deserializePool(serialized.pool),
    network: serialized.network,
    chainId: safeBigIntParse(serialized.chainId),
    root: safeBigIntParse(serialized.root),
    rootIndex: serialized.rootIndex,
    createdAtBlock: safeBigIntParse(serialized.createdAtBlock),
    createdAtTransaction: serialized.createdAtTransaction,
    createdAtTimestamp: safeBigIntParse(serialized.createdAtTimestamp),
  };
}

/**
 * ========================================
 * USER OPERATION TRANSFORMERS
 * ========================================
 */

/**
 * Serialize UserOperation (BigInt -> string)
 *
 * @param userOp - UserOperation entity
 * @returns Serialized user operation
 */
export function serializeUserOperation(
  userOp: UserOperation,
): SerializedUserOperation {
  return {
    id: userOp.id,
    userOpHash: userOp.userOpHash,
    paymaster: serializePaymasterContract(userOp.paymaster),
    pool: serializePool(userOp.pool),
    network: userOp.network,
    chainId: userOp.chainId.toString(),
    sender: userOp.sender,
    actualGasCost: userOp.actualGasCost.toString(),
    nullifier: userOp.nullifier.toString(),
    executedAtBlock: userOp.executedAtBlock.toString(),
    executedAtTransaction: userOp.executedAtTransaction,
    executedAtTimestamp: userOp.executedAtTimestamp.toString(),
    gasPrice: userOp.gasPrice?.toString(),
    totalGasUsed: userOp.totalGasUsed?.toString(),
  };
}

/**
 * Deserialize UserOperation (string -> BigInt)
 *
 * @param serialized - Serialized user operation
 * @returns UserOperation entity
 */
export function deserializeUserOperation(
  serialized: SerializedUserOperation,
): UserOperation {
  return {
    id: serialized.id,
    userOpHash: serialized.userOpHash,
    paymaster: deserializePaymasterContract(serialized.paymaster),
    pool: deserializePool(serialized.pool),
    network: serialized.network,
    chainId: safeBigIntParse(serialized.chainId),
    sender: serialized.sender,
    actualGasCost: safeBigIntParse(serialized.actualGasCost),
    nullifier: safeBigIntParse(serialized.nullifier),
    executedAtBlock: safeBigIntParse(serialized.executedAtBlock),
    executedAtTransaction: serialized.executedAtTransaction,
    executedAtTimestamp: safeBigIntParse(serialized.executedAtTimestamp),
    gasPrice: serialized.gasPrice
      ? safeBigIntParse(serialized.gasPrice)
      : undefined,
    totalGasUsed: serialized.totalGasUsed
      ? safeBigIntParse(serialized.totalGasUsed)
      : undefined,
  };
}

/**
 * ========================================
 * REVENUE WITHDRAWAL TRANSFORMERS
 * ========================================
 */

/**
 * Serialize RevenueWithdrawal (BigInt -> string)
 *
 * @param withdrawal - RevenueWithdrawal entity
 * @returns Serialized revenue withdrawal
 */
export function serializeRevenueWithdrawal(
  withdrawal: RevenueWithdrawal,
): SerializedRevenueWithdrawal {
  return {
    id: withdrawal.id,
    paymaster: serializePaymasterContract(withdrawal.paymaster),
    network: withdrawal.network,
    chainId: withdrawal.chainId.toString(),
    recipient: withdrawal.recipient,
    amount: withdrawal.amount.toString(),
    withdrawnAtBlock: withdrawal.withdrawnAtBlock.toString(),
    withdrawnAtTransaction: withdrawal.withdrawnAtTransaction,
    withdrawnAtTimestamp: withdrawal.withdrawnAtTimestamp.toString(),
  };
}

/**
 * Deserialize RevenueWithdrawal (string -> BigInt)
 *
 * @param serialized - Serialized revenue withdrawal
 * @returns RevenueWithdrawal entity
 */
export function deserializeRevenueWithdrawal(
  serialized: SerializedRevenueWithdrawal,
): RevenueWithdrawal {
  return {
    id: serialized.id,
    paymaster: deserializePaymasterContract(serialized.paymaster),
    network: serialized.network,
    chainId: safeBigIntParse(serialized.chainId),
    recipient: serialized.recipient,
    amount: safeBigIntParse(serialized.amount),
    withdrawnAtBlock: safeBigIntParse(serialized.withdrawnAtBlock),
    withdrawnAtTransaction: serialized.withdrawnAtTransaction,
    withdrawnAtTimestamp: safeBigIntParse(serialized.withdrawnAtTimestamp),
  };
}

/**
 * ========================================
 * ENHANCED NULLIFIER USAGE TRANSFORMERS
 * ========================================
 */

/**
 * Serialize NullifierUsage (BigInt -> string)
 *
 * @param nullifierUsage - NullifierUsage entity
 * @returns Serialized nullifier usage
 */
export function serializeNullifierUsage(
  nullifierUsage: NullifierUsage,
): SerializedNullifierUsage {
  return {
    id: nullifierUsage.id,
    nullifier: nullifierUsage.nullifier.toString(),
    paymaster: serializePaymasterContract(nullifierUsage.paymaster),
    pool: serializePool(nullifierUsage.pool),
    network: nullifierUsage.network,
    chainId: nullifierUsage.chainId.toString(),
    isUsed: nullifierUsage.isUsed,
    gasUsed: nullifierUsage.gasUsed.toString(),
    userOperation: nullifierUsage.userOperation
      ? serializeUserOperation(nullifierUsage.userOperation)
      : undefined,
    firstUsedAtBlock: nullifierUsage.firstUsedAtBlock?.toString(),
    firstUsedAtTransaction: nullifierUsage.firstUsedAtTransaction,
    firstUsedAtTimestamp: nullifierUsage.firstUsedAtTimestamp?.toString(),
    lastUpdatedBlock: nullifierUsage.lastUpdatedBlock.toString(),
    lastUpdatedTimestamp: nullifierUsage.lastUpdatedTimestamp.toString(),
  };
}

/**
 * Deserialize NullifierUsage (string -> BigInt)
 *
 * @param serialized - Serialized nullifier usage
 * @returns NullifierUsage entity
 */
export function deserializeNullifierUsage(
  serialized: SerializedNullifierUsage,
): NullifierUsage {
  return {
    id: serialized.id,
    nullifier: safeBigIntParse(serialized.nullifier),
    paymaster: deserializePaymasterContract(serialized.paymaster),
    pool: deserializePool(serialized.pool),
    network: serialized.network,
    chainId: safeBigIntParse(serialized.chainId),
    isUsed: serialized.isUsed,
    gasUsed: safeBigIntParse(serialized.gasUsed),
    userOperation: serialized.userOperation
      ? deserializeUserOperation(serialized.userOperation)
      : undefined,
    firstUsedAtBlock: serialized.firstUsedAtBlock
      ? safeBigIntParse(serialized.firstUsedAtBlock)
      : undefined,
    firstUsedAtTransaction: serialized.firstUsedAtTransaction,
    firstUsedAtTimestamp: serialized.firstUsedAtTimestamp
      ? safeBigIntParse(serialized.firstUsedAtTimestamp)
      : undefined,
    lastUpdatedBlock: safeBigIntParse(serialized.lastUpdatedBlock),
    lastUpdatedTimestamp: safeBigIntParse(serialized.lastUpdatedTimestamp),
  };
}

/**
 * ========================================
 * DAILY POOL STATS TRANSFORMERS
 * ========================================
 */

/**
 * Serialize DailyPoolStats (BigInt -> string)
 *
 * @param stats - DailyPoolStats entity
 * @returns Serialized daily pool stats
 */
export function serializeDailyPoolStats(
  stats: DailyPoolStats,
): SerializedDailyPoolStats {
  return {
    id: stats.id,
    date: stats.date,
    pool: serializePool(stats.pool),
    network: stats.network,
    chainId: stats.chainId.toString(),
    newMembers: stats.newMembers.toString(),
    userOperations: stats.userOperations.toString(),
    gasSpent: stats.gasSpent.toString(),
    revenueGenerated: stats.revenueGenerated.toString(),
    totalMembers: stats.totalMembers.toString(),
    totalDeposits: stats.totalDeposits.toString(),
  };
}

/**
 * Deserialize DailyPoolStats (string -> BigInt)
 *
 * @param serialized - Serialized daily pool stats
 * @returns DailyPoolStats entity
 */
export function deserializeDailyPoolStats(
  serialized: SerializedDailyPoolStats,
): DailyPoolStats {
  return {
    id: serialized.id,
    date: serialized.date,
    pool: deserializePool(serialized.pool),
    network: serialized.network,
    chainId: safeBigIntParse(serialized.chainId),
    newMembers: safeBigIntParse(serialized.newMembers),
    userOperations: safeBigIntParse(serialized.userOperations),
    gasSpent: safeBigIntParse(serialized.gasSpent),
    revenueGenerated: safeBigIntParse(serialized.revenueGenerated),
    totalMembers: safeBigIntParse(serialized.totalMembers),
    totalDeposits: safeBigIntParse(serialized.totalDeposits),
  };
}

/**
 * ========================================
 * DAILY GLOBAL STATS TRANSFORMERS
 * ========================================
 */

/**
 * Serialize DailyGlobalStats (BigInt -> string)
 *
 * @param stats - DailyGlobalStats entity
 * @returns Serialized daily global stats
 */
export function serializeDailyGlobalStats(
  stats: DailyGlobalStats,
): SerializedDailyGlobalStats {
  return {
    id: stats.id,
    date: stats.date,
    network: stats.network,
    chainId: stats.chainId.toString(),
    newPools: stats.newPools.toString(),
    totalNewMembers: stats.totalNewMembers.toString(),
    totalUserOperations: stats.totalUserOperations.toString(),
    totalGasSpent: stats.totalGasSpent.toString(),
    totalRevenueGenerated: stats.totalRevenueGenerated.toString(),
    totalActivePools: stats.totalActivePools.toString(),
    totalMembers: stats.totalMembers.toString(),
  };
}

/**
 * Deserialize DailyGlobalStats (string -> BigInt)
 *
 * @param serialized - Serialized daily global stats
 * @returns DailyGlobalStats entity
 */
export function deserializeDailyGlobalStats(
  serialized: SerializedDailyGlobalStats,
): DailyGlobalStats {
  return {
    id: serialized.id,
    date: serialized.date,
    network: serialized.network,
    chainId: safeBigIntParse(serialized.chainId),
    newPools: safeBigIntParse(serialized.newPools),
    totalNewMembers: safeBigIntParse(serialized.totalNewMembers),
    totalUserOperations: safeBigIntParse(serialized.totalUserOperations),
    totalGasSpent: safeBigIntParse(serialized.totalGasSpent),
    totalRevenueGenerated: safeBigIntParse(serialized.totalRevenueGenerated),
    totalActivePools: safeBigIntParse(serialized.totalActivePools),
    totalMembers: safeBigIntParse(serialized.totalMembers),
  };
}

/**
 * ========================================
 * NETWORK INFO TRANSFORMERS
 * ========================================
 */

/**
 * Serialize NetworkInfo (BigInt -> string)
 *
 * @param networkInfo - NetworkInfo entity
 * @returns Serialized network info
 */
export function serializeNetworkInfo(
  networkInfo: NetworkInfo,
): SerializedNetworkInfo {
  return {
    id: networkInfo.id,
    name: networkInfo.name,
    chainId: networkInfo.chainId.toString(),
    totalPaymasters: networkInfo.totalPaymasters.toString(),
    totalPools: networkInfo.totalPools.toString(),
    totalMembers: networkInfo.totalMembers.toString(),
    totalUserOperations: networkInfo.totalUserOperations.toString(),
    totalGasSpent: networkInfo.totalGasSpent.toString(),
    totalRevenue: networkInfo.totalRevenue.toString(),
    firstDeploymentBlock: networkInfo.firstDeploymentBlock.toString(),
    firstDeploymentTimestamp: networkInfo.firstDeploymentTimestamp.toString(),
    lastActivityBlock: networkInfo.lastActivityBlock.toString(),
    lastActivityTimestamp: networkInfo.lastActivityTimestamp.toString(),
  };
}

/**
 * Deserialize NetworkInfo (string -> BigInt)
 *
 * @param serialized - Serialized network info
 * @returns NetworkInfo entity
 */
export function deserializeNetworkInfo(
  serialized: SerializedNetworkInfo,
): NetworkInfo {
  return {
    id: serialized.id,
    name: serialized.name,
    chainId: safeBigIntParse(serialized.chainId),
    totalPaymasters: safeBigIntParse(serialized.totalPaymasters),
    totalPools: safeBigIntParse(serialized.totalPools),
    totalMembers: safeBigIntParse(serialized.totalMembers),
    totalUserOperations: safeBigIntParse(serialized.totalUserOperations),
    totalGasSpent: safeBigIntParse(serialized.totalGasSpent),
    totalRevenue: safeBigIntParse(serialized.totalRevenue),
    firstDeploymentBlock: safeBigIntParse(serialized.firstDeploymentBlock),
    firstDeploymentTimestamp: safeBigIntParse(
      serialized.firstDeploymentTimestamp,
    ),
    lastActivityBlock: safeBigIntParse(serialized.lastActivityBlock),
    lastActivityTimestamp: safeBigIntParse(serialized.lastActivityTimestamp),
  };
}

/**
 * ========================================
 * BATCH TRANSFORMATION UTILITIES
 * ========================================
 */

/**
 * Serialize an array of entities
 *
 * @param entities - Array of entities to serialize
 * @param serializeFn - Serialization function
 * @returns Array of serialized entities
 */
export function serializeArray<T, S>(
  entities: T[],
  serializeFn: (entity: T) => S,
): S[] {
  return entities.map(serializeFn);
}

/**
 * Deserialize an array of entities
 *
 * @param serializedEntities - Array of serialized entities
 * @param deserializeFn - Deserialization function
 * @returns Array of deserialized entities
 */
export function deserializeArray<T, S>(
  serializedEntities: S[],
  deserializeFn: (serialized: S) => T,
): T[] {
  return serializedEntities.map(deserializeFn);
}

/**
 * ========================================
 * VALIDATION UTILITIES
 * ========================================
 */

/**
 * Validate serialized entity structure
 *
 * @param entity - Entity to validate
 * @param requiredFields - Required fields
 * @returns True if valid
 */
export function validateSerializedEntity(
  entity: any,
  requiredFields: string[],
): boolean {
  if (!entity || typeof entity !== "object") {
    return false;
  }

  return requiredFields.every((field) => field in entity);
}

/**
 * Validate network consistency across entities
 *
 * @param entities - Entities to validate
 * @param expectedNetwork - Expected network
 * @returns True if all entities belong to expected network
 */
export function validateNetworkConsistency(
  entities: Array<{ network: string }>,
  expectedNetwork: string,
): boolean {
  return entities.every((entity) => entity.network === expectedNetwork);
}

/**
 * ========================================
 * ANALYTICS TRANSFORMATION UTILITIES
 * ========================================
 */

/**
 * Transform analytics data for charts
 *
 * @param dailyStats - Daily statistics
 * @returns Chart-ready data
 */
export function transformAnalyticsForCharts(
  dailyStats: DailyGlobalStats[],
): Array<{
  date: string;
  newPools: number;
  newMembers: number;
  userOperations: number;
  gasSpent: number;
  revenue: number;
}> {
  return dailyStats.map((stat) => ({
    date: stat.date,
    newPools: Number(stat.newPools),
    newMembers: Number(stat.totalNewMembers),
    userOperations: Number(stat.totalUserOperations),
    gasSpent: Number(stat.totalGasSpent) / 10 ** 18, // Convert to ETH
    revenue: Number(stat.totalRevenueGenerated) / 10 ** 18, // Convert to ETH
  }));
}

/**
 * Calculate growth rates from time series data
 *
 * @param timeSeries - Time series data
 * @param valueField - Field to calculate growth for
 * @returns Growth rates
 */
export function calculateGrowthRates(
  timeSeries: Array<{ date: string; [key: string]: any }>,
  valueField: string,
): Array<{ date: string; value: number; growthRate: number }> {
  const result: Array<{ date: string; value: number; growthRate: number }> = [];

  for (let i = 0; i < timeSeries.length; i++) {
    const current = timeSeries[i];
    if (!current || current[valueField] === undefined) continue;

    const previous = timeSeries[i - 1];
    const currentValue = Number(current[valueField]);

    const growthRate =
      previous && previous[valueField] !== undefined
        ? calculatePercentageChange(
            BigInt(previous[valueField]),
            BigInt(current[valueField]),
          )
        : 0;

    result.push({
      date: current.date,
      value: currentValue,
      growthRate,
    });
  }

  return result;
}

/**
 * ========================================
 * EXPORT CONVENIENCE FUNCTIONS
 * ========================================
 */

/**
 * All serialization functions
 */
export const serializers = {
  paymasterContract: serializePaymasterContract,
  pool: serializePool,
  poolMember: serializePoolMember,
  merkleRoot: serializeMerkleRoot,
  userOperation: serializeUserOperation,
  revenueWithdrawal: serializeRevenueWithdrawal,
  nullifierUsage: serializeNullifierUsage,
  dailyPoolStats: serializeDailyPoolStats,
  dailyGlobalStats: serializeDailyGlobalStats,
  networkInfo: serializeNetworkInfo,
};

/**
 * All deserialization functions
 */
export const deserializers = {
  paymasterContract: deserializePaymasterContract,
  pool: deserializePool,
  poolMember: deserializePoolMember,
  merkleRoot: deserializeMerkleRoot,
  userOperation: deserializeUserOperation,
  revenueWithdrawal: deserializeRevenueWithdrawal,
  nullifierUsage: deserializeNullifierUsage,
  dailyPoolStats: deserializeDailyPoolStats,
  dailyGlobalStats: deserializeDailyGlobalStats,
  networkInfo: deserializeNetworkInfo,
};

/**
 * All formatting functions
 */
export const formatters = {
  bigInt: formatBigIntValue,
  gas: formatGasValue,
  currency: formatCurrencyValue,
  timestamp: formatTimestamp,
  timestampWithTime: formatTimestampWithTime,
  percentageChange: calculatePercentageChange,
};

/**
 * All validation functions
 */
export const validators = {
  bigIntString: isValidBigIntString,
  serializedEntity: validateSerializedEntity,
  networkConsistency: validateNetworkConsistency,
};

export function convertBigIntsToStrings(
  obj: Record<string, any>,
): Record<string, any> {
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === "bigint") {
        newObj[key] = value.toString();
      } else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        newObj[key] = convertBigIntsToStrings(value);
      } else {
        newObj[key] = value;
      }
    }
  }
  return newObj;
}
