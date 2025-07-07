/**
 * TypeScript type definitions for analytics entities in the prepaid gas paymaster subgraph
 *
 * These types represent specialized analytics functionality including:
 * - Daily aggregated statistics (pool and global)
 * - Revenue tracking and withdrawal metrics
 * - Nullifier usage analytics
 * - Advanced metrics and reporting
 */

// Import core types from the data package
import type {
  PaymasterContract,
  Pool,
  SerializedPaymasterContract,
  SerializedPool,
  SerializedUserOperation,
  UserOperation,
} from "@workspace/data";

/**
 * RevenueWithdrawal entity
 * Represents a revenue withdrawal from a paymaster
 */
export interface RevenueWithdrawal {
  /** Transaction hash + log index as ID (network-prefixed) */
  id: string;
  /** Paymaster that withdrew revenue */
  paymaster: PaymasterContract;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Recipient of the withdrawal */
  recipient: string;
  /** Amount withdrawn */
  amount: bigint;
  /** Block of withdrawal */
  withdrawnAtBlock: bigint;
  /** Transaction hash of withdrawal */
  withdrawnAtTransaction: string;
  /** Timestamp of withdrawal */
  withdrawnAtTimestamp: bigint;
}

/**
 * Enhanced NullifierUsage entity
 * Tracks nullifier usage across different paymaster types
 */
export interface NullifierUsage {
  /** Nullifier as ID (network-prefixed) */
  id: string;
  /** Nullifier value */
  nullifier: bigint;
  /** Paymaster contract */
  paymaster: PaymasterContract;
  /** Pool where nullifier was used */
  pool: Pool;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Whether nullifier is used (for OneTimeUse) */
  isUsed: boolean;
  /** Gas used by this nullifier (for GasLimited) */
  gasUsed: bigint;
  /** User operation that used this nullifier */
  userOperation?: UserOperation;
  /** Block when first used */
  firstUsedAtBlock?: bigint;
  /** Transaction hash when first used */
  firstUsedAtTransaction?: string;
  /** Timestamp when first used */
  firstUsedAtTimestamp?: bigint;
  /** Last updated block */
  lastUpdatedBlock: bigint;
  /** Last updated timestamp */
  lastUpdatedTimestamp: bigint;
}

/**
 * DailyPoolStats entity
 * Daily aggregated statistics for a pool
 */
export interface DailyPoolStats {
  /** Date (YYYY-MM-DD) + Pool ID as ID (network-prefixed) */
  id: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Pool */
  pool: Pool;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Daily new members */
  newMembers: bigint;
  /** Daily user operations */
  userOperations: bigint;
  /** Daily gas spent */
  gasSpent: bigint;
  /** Daily revenue generated */
  revenueGenerated: bigint;
  /** Total members at end of day */
  totalMembers: bigint;
  /** Total deposits at end of day */
  totalDeposits: bigint;
}

/**
 * DailyGlobalStats entity
 * Global daily statistics across all paymasters
 */
export interface DailyGlobalStats {
  /** Date (YYYY-MM-DD) + Network as ID (network-prefixed) */
  id: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Total pools created this day */
  newPools: bigint;
  /** Total new members across all pools */
  totalNewMembers: bigint;
  /** Total user operations across all paymasters */
  totalUserOperations: bigint;
  /** Total gas spent across all paymasters */
  totalGasSpent: bigint;
  /** Total revenue generated across all paymasters */
  totalRevenueGenerated: bigint;
  /** Total active pools */
  totalActivePools: bigint;
  /** Total members across all pools */
  totalMembers: bigint;
}

/**
 * ========================================
 * SERIALIZED TYPES (for API responses)
 * ========================================
 */

/**
 * Serialized RevenueWithdrawal (BigInt -> string)
 */
export interface SerializedRevenueWithdrawal {
  id: string;
  paymaster: SerializedPaymasterContract;
  network: string;
  chainId: string;
  recipient: string;
  amount: string;
  withdrawnAtBlock: string;
  withdrawnAtTransaction: string;
  withdrawnAtTimestamp: string;
}

/**
 * Serialized NullifierUsage (BigInt -> string)
 */
export interface SerializedNullifierUsage {
  id: string;
  nullifier: string;
  paymaster: SerializedPaymasterContract;
  pool: SerializedPool;
  network: string;
  chainId: string;
  isUsed: boolean;
  gasUsed: string;
  userOperation?: SerializedUserOperation;
  firstUsedAtBlock?: string;
  firstUsedAtTransaction?: string;
  firstUsedAtTimestamp?: string;
  lastUpdatedBlock: string;
  lastUpdatedTimestamp: string;
}

/**
 * Serialized DailyPoolStats (BigInt -> string)
 */
export interface SerializedDailyPoolStats {
  id: string;
  date: string;
  pool: SerializedPool;
  network: string;
  chainId: string;
  newMembers: string;
  userOperations: string;
  gasSpent: string;
  revenueGenerated: string;
  totalMembers: string;
  totalDeposits: string;
}

/**
 * Serialized DailyGlobalStats (BigInt -> string)
 */
export interface SerializedDailyGlobalStats {
  id: string;
  date: string;
  network: string;
  chainId: string;
  newPools: string;
  totalNewMembers: string;
  totalUserOperations: string;
  totalGasSpent: string;
  totalRevenueGenerated: string;
  totalActivePools: string;
  totalMembers: string;
}

/**
 * Serialized NetworkInfo (BigInt -> string)
 */
export interface SerializedNetworkInfo {
  id: string;
  name: string;
  chainId: string;
  totalPaymasters: string;
  totalPools: string;
  totalMembers: string;
  totalUserOperations: string;
  totalGasSpent: string;
  totalRevenue: string;
  firstDeploymentBlock: string;
  firstDeploymentTimestamp: string;
  lastActivityBlock: string;
  lastActivityTimestamp: string;
}
