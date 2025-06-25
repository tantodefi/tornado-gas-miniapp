// src/client/types.ts
import { PaginationOptions } from "@workspace/data";
import { Address, PartialBy } from "viem";
import { UserOperation } from "viem/account-abstraction";

/**
 * Pool data with all available fields
 */
export interface PoolData {
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
}

/**
 * Available pool fields for selection
 */
export type PoolFields = keyof PoolData;

/**
 * Configuration options for the PrepaidGasPaymaster client
 */
export interface PrepaidGasPaymasterConfig {
  /** Network/chain to use (e.g., 'base-sepolia', 'base-mainnet') */
  network: string;
  /** URL of the subgraph endpoint (overrides network default) */
  subgraphUrl?: string;
  /** RPC URL for blockchain interactions (overrides network default) */
  rpcUrl?: string;
  /** Default timeout for requests in milliseconds */
  timeout?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Parameters for getting paymaster stub data (v0.7 compatible)
 */
export type GetPaymasterStubDataV7Parameters = PartialBy<
  Pick<
    UserOperation<"0.7">,
    | "callData"
    | "callGasLimit"
    | "factory"
    | "factoryData"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "nonce"
    | "sender"
    | "preVerificationGas"
    | "verificationGasLimit"
  >,
  | "callGasLimit"
  | "factory"
  | "factoryData"
  | "maxFeePerGas"
  | "maxPriorityFeePerGas"
  | "preVerificationGas"
  | "verificationGasLimit"
> & {
  context?: unknown;
  chainId: number;
  entryPointAddress: Address;
};

/**
 * Pool membership information including pool details
 */
export interface PoolMembershipInfo {
  membershipId: string;
  identityCommitment: string;
  memberIndex: string;
  joinedAt: string;
  joinedAtBlock: string;
  pool: {
    poolId: bigint;
    joiningFee: string;
    membersCount: bigint;
    totalDeposits: string;
    createdAt: bigint;
  };
}

/**
 * General options for subgraph queries
 */
export interface SubgraphQueryOptions extends PaginationOptions {
  /** Block number to query at (optional) */
  blockNumber?: number;
  /** Timestamp to query from (optional) */
  timestamp?: number;
}

/**
 * Filter options for pool queries
 */
export interface PoolQueryFilters {
  /** Filter by minimum joining fee */
  minJoiningFee?: bigint;
  /** Filter by maximum joining fee */
  maxJoiningFee?: bigint;
  /** Filter by minimum member count */
  minMembers?: number;
  /** Filter by maximum member count */
  maxMembers?: number;
  /** Filter by creation date (after) */
  createdAfter?: bigint;
  /** Filter by creation date (before) */
  createdBefore?: bigint;
}

/**
 * Sort options for queries
 */
export interface SortOptions {
  /** Field to sort by */
  field: "createdAt" | "joiningFee" | "memberCount" | "totalDeposits";
  /** Sort direction */
  direction: "asc" | "desc";
}

/**
 * Enhanced pool query parameters
 */
export interface PoolQueryParams extends SubgraphQueryOptions {
  /** Filters to apply */
  filters?: PoolQueryFilters;
  /** Sorting options */
  sort?: SortOptions;
}

/**
 * Response wrapper for paginated queries
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Total count (if available) */
  totalCount?: number;
  /** Whether there are more items */
  hasMore: boolean;
  /** Next cursor for pagination */
  nextCursor?: string;
}

/**
 * Query result status
 */
export interface QueryResult<T> {
  /** Whether the query was successful */
  success: boolean;
  /** Result data (if successful) */
  data?: T;
  /** Error message (if failed) */
  error?: string;
  /** Additional metadata */
  metadata?: {
    /** Query execution time in milliseconds */
    executionTime: number;
    /** Block number queried */
    blockNumber?: bigint;
    /** Whether data is from cache */
    fromCache?: boolean;
  };
}
