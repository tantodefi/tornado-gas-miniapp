/**
 * @workspace/data - Subgraph data access layer
 *
 * This package handles all subgraph interactions and data transformations
 * for the prepaid gas paymaster system.
 */

// Core types (exact match to subgraph schema)
export type {
  Pool,
  PoolMember,
  MerkleRootHistory,
  PoolCreatedEvent,
  MemberAddedEvent,
  MembersAddedEvent,
  OwnershipTransferredEvent,
  NetworkMetadata,
  SubgraphResponse,
} from "./types/subgraph.js";

// Client types and class
export type {
  SubgraphClientConfig,
  PaginationOptions,
  PoolQueryOptions,
} from "./client/subgraph-client.js";

export { SubgraphClient } from "./client/subgraph-client.js";

// GraphQL queries (for advanced users who want to customize)
export {
  GET_POOLS_BY_IDENTITY,
  GET_POOL_MEMBERS,
  GET_VALID_ROOT_INDICES,
  FIND_ROOT_INDEX,
  GET_POOL_ROOT_HISTORY,
  GET_ALL_POOLS,
  GET_POOL_DETAILS,
  buildPoolsQuery,
} from "./client/queries.js";

// Data transformers (for BigInt serialization)
export type {
  SerializedPool,
  SerializedPoolMember,
  SerializedMerkleRootHistory,
} from "./transformers/index.js";

export {
  serializePool,
  deserializePool,
  serializePoolMember,
  deserializePoolMember,
  serializeMerkleRootHistory,
  deserializeMerkleRootHistory,
  safeBigIntParse,
  isValidBigIntString,
  formatBigIntValue,
} from "./transformers/index.js";

// Network configuration exports
export type { NetworkConfig } from "./network/config.js";
export { BASE_SEPOLIA_NETWORK } from "./network/config.js";

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
} from "./network/presets.js";

// ✨ NEW: Query Builder Exports
// Main query builder class
export { QueryBuilder } from "./query/query-builder.js";

// Entity-specific query builders
export {
  PoolQueryBuilder,
  PoolQueryWithMembersBuilder,
} from "./query/builders/pool-query-builder.js";
export {
  PoolMemberQueryBuilder,
  MemberQueryWithPoolBuilder,
} from "./query/builders/member-query-builder.js";

// Base query builder (for advanced usage or extending)
export { BaseQueryBuilder } from "./query/builders/base-query-builder.js";

// Query configuration and field types
export type {
  QueryConfig,
  PoolFields,
  PoolMemberFields,
  MerkleRootHistoryFields,
  WhereCondition,
} from "./query/types.js";

// Where condition input types for filtering
export type {
  PoolWhereInput,
  PoolMemberWhereInput,
  MerkleRootHistoryWhereInput,
} from "./query/types.js";

// Package version
export const VERSION = "1.0.0";
