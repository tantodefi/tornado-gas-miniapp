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
  RootHistoryItem,
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

// Package version
export const VERSION = "1.0.0";
