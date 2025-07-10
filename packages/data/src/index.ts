/**
 * @workspace/data - Subgraph data access layer
 *
 * This package handles all subgraph interactions and data transformations
 * for the prepaid gas paymaster system.
 *
 * Updated for new PaymasterContract-based subgraph structure with comprehensive
 * analytics, revenue tracking, and multi-paymaster support.
 */

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
  NetworkMetadata,
  SubgraphResponse,
  PaymasterType,
} from "./types/subgraph.js";

// Event types
export type {
  ChainId,
  NetworkName,
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

// Package version
export const VERSION = "2.0.0";
