// src/client/types.ts
import { PaginationOptions } from "@workspace/data";
import { Address, PartialBy } from "viem";
import { UserOperation } from "viem/account-abstraction";
import { NetworkConfig } from "../networks";

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
  /** URL of the subgraph endpoint (required) */
  subgraphUrl: string;
  /** Network configuration */
  network: NetworkConfig;
  /** RPC URL for blockchain interactions (optional, will use default) */
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
 * Sort options for pool queries
 */
export interface SortOptions {
  /** Field to sort by */
  field: PoolFields;
  /** Sort direction */
  direction: "asc" | "desc";
}

/**
 * Parameters for pool queries
 */
export interface PoolQueryParams extends SubgraphQueryOptions {
  /** Filters to apply */
  filters?: PoolQueryFilters;
  /** Sort options */
  sort?: SortOptions;
  /** Fields to include in response */
  fields?: PoolFields[];
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Data items */
  items: T[];
  /** Pagination information */
  pagination: {
    /** Total number of items */
    total: number;
    /** Current page */
    page: number;
    /** Items per page */
    limit: number;
    /** Whether there are more pages */
    hasMore: boolean;
  };
}

/**
 * Generic query result wrapper
 */
export interface QueryResult<T> {
  /** Query data */
  data: T;
  /** Query metadata */
  meta: {
    /** Time taken to execute query */
    executionTime: number;
    /** Whether data is from cache */
    cached: boolean;
    /** Block number when query was executed */
    blockNumber?: number;
  };
}
