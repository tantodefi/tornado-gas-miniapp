/**
 * @workspace/data - Subgraph data access layer
 *
 * This package handles all subgraph interactions and data transformations
 * for the prepaid gas paymaster system.
 *
 * Updated for new PaymasterContract-based subgraph structure with comprehensive
 * analytics, revenue tracking, and multi-paymaster support.
 */

import { SubgraphClient } from "./client/subgraph-client.js";
import { getSupportedChainIds } from "./network/presets.js";
import {
  ChainId,
  PaymasterContract,
  PaymasterType,
  Pool,
  UserOperation,
} from "./types/subgraph.js";

/**
 * ========================================
 * CORE TYPES (exact match to subgraph schema)
 * ========================================
 */

// Main entity types
export type {
  PaymasterContract,
  Pool,
  PoolMember,
  MerkleRoot,
  UserOperation,
  RevenueWithdrawal,
  NullifierUsage,
  DailyPoolStats,
  DailyGlobalStats,
  NetworkMetadata,
  SubgraphResponse,
  PaymasterType,
} from "./types/subgraph.js";

// Event types
export type {
  PoolCreatedEvent,
  MemberAddedEvent,
  MembersAddedEvent,
  UserOpSponsoredEvent,
  RevenueWithdrawnEvent,
  OwnershipTransferredEvent,
} from "./types/subgraph.js";

/**
 * ========================================
 * CLIENT TYPES AND CLASSES
 * ========================================
 */

// Client configuration and interfaces
export type {
  SubgraphClientConfig,
  PaginationOptions,
  PoolQueryOptions,
  PaymasterQueryOptions,
  UserOperationQueryOptions,
  AnalyticsQueryOptions,
} from "./client/subgraph-client.js";

// Main client class
export { SubgraphClient } from "./client/subgraph-client.js";

/**
 * ========================================
 * DATA TRANSFORMERS (for BigInt serialization)
 * ========================================
 */
// Serialized type definitions
export type {
  SerializedPaymasterContract,
  SerializedPool,
  SerializedPoolMember,
  SerializedMerkleRoot,
  SerializedUserOperation,
  SerializedRevenueWithdrawal,
  SerializedNullifierUsage,
  SerializedDailyPoolStats,
  SerializedDailyGlobalStats,
} from "./types/subgraph.js";

// Serialization functions
export {
  serializePaymasterContract,
  deserializePaymasterContract,
  serializePool,
  deserializePool,
  serializePoolMember,
  deserializePoolMember,
  serializeMerkleRoot,
  deserializeMerkleRoot,
  serializeUserOperation,
  deserializeUserOperation,
  serializeRevenueWithdrawal,
  deserializeRevenueWithdrawal,
  serializeNullifierUsage,
  deserializeNullifierUsage,
  serializeDailyPoolStats,
  deserializeDailyPoolStats,
  serializeDailyGlobalStats,
  deserializeDailyGlobalStats,
} from "./transformers/index.js";

// Utility functions
export {
  safeBigIntParse,
  isValidBigIntString,
  formatBigIntValue,
  formatGasValue,
  formatCurrencyValue,
  calculatePercentageChange,
  formatTimestamp,
  formatTimestampWithTime,
} from "./transformers/index.js";

/**
 * ========================================
 * NETWORK CONFIGURATION
 * ========================================
 */

// Network configuration types
export type {
  NetworkConfig,
  PaymasterContractConfig,
} from "./network/config.js";

// Network configurations
export {
  BASE_SEPOLIA_NETWORK,
  getAllPaymasterContracts,
  getPaymasterByType,
  hasPaymasterType,
  getPaymasterByAddress,
  getDefaultPaymaster,
  validateNetworkConfig,
} from "./network/config.js";

// Network presets and utilities
export type { NetworkPreset } from "./network/presets.js";
export {
  BASE_SEPOLIA_PRESET,
  NETWORK_PRESETS,
  NETWORK_PRESETS_BY_NAME,
  getNetworkPreset,
  getNetworkPresetByName,
  getSupportedChainIds,
  getSupportedNetworkNames,
  isSupportedChainId,
  getUnsupportedNetworkError,
  validateNetworkPreset,
  getValidatedNetworkPreset,
  getPaymasterContracts,
  getPaymasterContract,
  supportsPaymasterType,
} from "./network/presets.js";

/**
 * ========================================
 * QUERY BUILDER API
 * ========================================
 */

// Main query builder class
export { QueryBuilder } from "./query/query-builder.js";

// Entity-specific query builders
export { PaymasterContractQueryBuilder } from "./query/builders/paymaster-query-builder.js";

export { PoolQueryBuilder } from "./query/builders/pool-query-builder.js";

export { PoolMemberQueryBuilder } from "./query/builders/member-query-builder.js";

export { UserOperationQueryBuilder } from "./query/builders/user-operation-query-builder.js";

export { RevenueWithdrawalQueryBuilder } from "./query/builders/revenue-query-builder.js";

export { NullifierUsageQueryBuilder } from "./query/builders/nullifier-usage-query-builder.js";

// export {
//   DailyPoolStatsQueryBuilder,
//   DailyPoolStatsQueryWithPoolBuilder,
//   DailyGlobalStatsQueryBuilder,
// } from "./query/builders/analytics-query-builder.js";

// Base query builder (for advanced usage or extending)
export { BaseQueryBuilder } from "./query/builders/base-query-builder.js";

/**
 * ========================================
 * QUERY CONFIGURATION AND FIELD TYPES
 * ========================================
 */

// Query configuration
export type { QueryConfig } from "./query/types.js";

// Field type definitions
export type {
  PaymasterContractFields,
  PoolFields,
  PoolMemberFields,
  MerkleRootFields,
  UserOperationFields,
  RevenueWithdrawalFields,
  NullifierUsageFields,
  DailyPoolStatsFields,
  DailyGlobalStatsFields,
} from "./query/types.js";

// Where condition types
export type { WhereCondition } from "./query/types.js";

// Entity-specific where input types
export type {
  PaymasterContractWhereInput,
  PoolWhereInput,
  PoolMemberWhereInput,
  MerkleRootWhereInput,
  UserOperationWhereInput,
  RevenueWithdrawalWhereInput,
  NullifierUsageWhereInput,
  DailyPoolStatsWhereInput,
  DailyGlobalStatsWhereInput,
} from "./query/types.js";

// Utility types
export type {
  RootHistoryItem,
  UserOperationItem,
  RevenueWithdrawalItem,
  DailyStatsItem,
  GlobalStatsItem,
  DateRangeFilter,
  CursorPaginationOptions,
  PaginatedResponse,
} from "./query/types.js";

/**
 * ========================================
 * CONVENIENCE EXPORTS
 * ========================================
 */

/**
 * Create a SubgraphClient for Base Sepolia (most common use case)
 *
 * @param options - Optional configuration overrides
 * @returns Configured SubgraphClient for Base Sepolia
 *
 * @example
 * ```typescript
 * import { createBaseSepolia } from "@workspace/data";
 *
 * const client = createBaseSepolia();
 * const pools = await client.query().pools().execute();
 * ```
 */
export function createBaseSepolia(
  options: {
    subgraphUrl?: string;
    timeout?: number;
  } = {},
): SubgraphClient {
  return SubgraphClient.createForNetwork(84532, options);
}

/**
 * Create a SubgraphClient for any supported network
 *
 * @param chainId - Chain ID of the target network
 * @param options - Optional configuration overrides
 * @returns Configured SubgraphClient for the specified network
 *
 * @example
 * ```typescript
 * import { createClient } from "@workspace/data";
 *
 * const client = createClient(84532); // Base Sepolia
 * const paymasters = await client.query().paymasters().execute();
 * ```
 */
export function createClient(
  chainId: number,
  options: {
    subgraphUrl?: string;
    timeout?: number;
  } = {},
): SubgraphClient {
  return SubgraphClient.createForNetwork(chainId, options);
}

/**
 * Get all supported networks
 *
 * @returns Array of supported network information
 *
 * @example
 * ```typescript
 * import { getSupportedNetworks } from "@workspace/data";
 *
 * const networks = getSupportedNetworks();
 * console.log(networks.map(n => n.network.chainName)); // ["Base Sepolia"]
 * ```
 */
export function getSupportedNetworks() {
  return SubgraphClient.getSupportedNetworks();
}

/**
 * Check if a chain ID is supported
 *
 * @param chainId - Chain ID to check
 * @returns True if supported, false otherwise
 *
 * @example
 * ```typescript
 * import { isNetworkSupported } from "@workspace/data";
 *
 * if (isNetworkSupported(84532)) {
 *   const client = createClient(84532);
 * }
 * ```
 */
export function isNetworkSupported(chainId: number): boolean {
  return SubgraphClient.isNetworkSupported(chainId);
}

/**
 * Get paymaster contracts for a network
 *
 * @param chainId - Chain ID to get contracts for
 * @returns Array of paymaster contract information
 *
 * @example
 * ```typescript
 * import { getNetworkPaymasters } from "@workspace/data";
 *
 * const paymasters = getNetworkPaymasters(84532);
 * console.log(paymasters); // [{ address: "0x...", type: "GasLimited" }]
 * ```
 */
export function getNetworkPaymasters(chainId: ChainId) {
  return SubgraphClient.getPaymasterContracts(chainId);
}

/**
 * ========================================
 * CONSTANTS AND METADATA
 * ========================================
 */

// Package version
export const VERSION = "2.0.0";

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = getSupportedChainIds();

// Default configuration values
export const DEFAULT_CONFIG = {
  /** Default pagination limit */
  DEFAULT_LIMIT: 100,
  /** Default pagination skip */
  DEFAULT_SKIP: 0,
  /** Default request timeout */
  DEFAULT_TIMEOUT: 30000,
  /** Maximum pagination limit */
  MAX_LIMIT: 1000,
} as const;

// Paymaster contract types
export const PAYMASTER_TYPES = ["GasLimited", "OneTimeUse"] as const;

// Common BigInt values
export const BIGINT_CONSTANTS = {
  ZERO: "0",
  ONE: "1",
  GWEI: "1000000000",
  ETH: "1000000000000000000",
} as const;

/**
 * ========================================
 * TYPE GUARDS AND VALIDATION
 * ========================================
 */

/**
 * Type guard to check if an object is a PaymasterContract
 *
 * @param obj - Object to check
 * @returns True if object is a PaymasterContract
 */
export function isPaymasterContract(obj: any): obj is PaymasterContract {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.contractType === "string" &&
    typeof obj.address === "string" &&
    (obj.contractType === "GasLimited" || obj.contractType === "OneTimeUse")
  );
}

/**
 * Type guard to check if an object is a Pool
 *
 * @param obj - Object to check
 * @returns True if object is a Pool
 */
export function isPool(obj: any): obj is Pool {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.poolId === "bigint" &&
    typeof obj.joiningFee === "bigint" &&
    typeof obj.memberCount === "bigint"
  );
}

/**
 * Type guard to check if an object is a UserOperation
 *
 * @param obj - Object to check
 * @returns True if object is a UserOperation
 */
export function isUserOperation(obj: any): obj is UserOperation {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.userOpHash === "string" &&
    typeof obj.sender === "string" &&
    typeof obj.actualGasCost === "bigint"
  );
}

/**
 * Validate a chain ID
 *
 * @param chainId - Chain ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidChainId(chainId: any): chainId is number {
  return (
    typeof chainId === "number" && chainId > 0 && Number.isInteger(chainId)
  );
}

/**
 * Validate a paymaster type
 *
 * @param type - Type to validate
 * @returns True if valid, false otherwise
 */
export function isValidPaymasterType(type: any): type is PaymasterType {
  return typeof type === "string" && PAYMASTER_TYPES.includes(type as any);
}

/**
 * Validate an Ethereum address
 *
 * @param address - Address to validate
 * @returns True if valid, false otherwise
 */
export function isValidAddress(address: any): address is string {
  return (
    typeof address === "string" &&
    address.length === 42 &&
    address.startsWith("0x") &&
    /^0x[0-9a-fA-F]{40}$/.test(address)
  );
}

/**
 * Validate a date string (YYYY-MM-DD format)
 *
 * @param date - Date string to validate
 * @returns True if valid, false otherwise
 */
export function isValidDateString(date: any): date is string {
  return (
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !isNaN(Date.parse(date))
  );
}
