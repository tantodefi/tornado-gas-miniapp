/**
 * Core query builder types and interfaces
 * Updated for new subgraph schema structure
 */

import {
  MerkleRoot,
  NetworkInfo,
  NetworkName,
  PaymasterContract,
  PaymasterType,
  Pool,
  PoolMember,
  UserOperation,
} from "../types/subgraph";

/**
 * Base query configuration for GraphQL queries
 */
export interface QueryConfig<TWhereInput, TOrderBy> {
  /** Number of items to fetch */
  first?: number;
  /** Number of items to skip (for pagination) */
  skip?: number;
  /** Field to order by */
  orderBy?: TOrderBy;
  /** Order direction */
  orderDirection?: "asc" | "desc";
  /** Where conditions */
  where?: Partial<TWhereInput>;
  /** Network name */
  network?: NetworkName;
  // For dynamic selection
  selectedFields?: string[];
}

/**
 * ========================================
 * FIELD TYPE DEFINITIONS
 * ========================================
 */

/**
 * Available fields for PaymasterContract entity queries
 */
export type PaymasterContractFields =
  | keyof PaymasterContract
  | "pools { id poolId network }" // Example of nested fields
  | "userOperations { id userOpHash sender }"
  | "revenueWithdrawals { id amount recipient }";

/**
 * Available fields for Pool entity queries
 * Updated to match new subgraph schema
 */
export type PoolFields =
  | keyof Pool
  | "paymaster { id contractType address }"
  | "members { id memberIndex }"
  | "merkleRoots { id root }";

/**
 * Available fields for PoolMember entity queries
 * Updated to match new subgraph schema
 */
export type PoolMemberFields =
  | keyof PoolMember
  | "pool { id poolId network chainId }"
  | "pool { paymaster { id address } }";

/**
 * Available fields for MerkleRoot entity queries
 * Updated from MerkleRootHistoryFields
 */
export type MerkleRootFields = keyof MerkleRoot;

/**
 * Available fields for UserOperation entity queries
 */
export type UserOperationFields =
  | keyof UserOperation
  | "paymaster { id address contractType }" // Example of nested fields
  | "pool { id poolId }";

/**
 * Available fields for NetworkInfo entity queries
 */
export type NetworkInfoFields = keyof NetworkInfo;

/**
 * ========================================
 * WHERE CONDITION TYPES
 * ========================================
 */

/**
 * Where condition operators for filtering
 * Supports common GraphQL filtering operations
 */
export interface WhereCondition<T = any> {
  /** Equal to */
  eq?: T;
  /** Not equal to */
  ne?: T;
  /** Greater than */
  gt?: T;
  /** Greater than or equal to */
  gte?: T;
  /** Less than */
  lt?: T;
  /** Less than or equal to */
  lte?: T;
  /** In array */
  in?: T[];
  /** Not in array */
  notIn?: T[];
  /** Contains substring */
  contains?: string;
  /** Does not contain substring */
  notContains?: string;
  /** Starts with */
  startsWith?: string;
  /** Ends with */
  endsWith?: string;
}

/**
 * Typed where conditions for PaymasterContract entity
 */
export interface PaymasterContractWhereInput {
  id?: string; // network-address composite ID
  network?: NetworkName;
  contractType?: PaymasterType;
  address?: string;
  revenue_gte?: string; // GraphQL expects BigInt as string
  revenue_lte?: string; // GraphQL expects BigInt as string
  currentDeposit_gte?: string; // GraphQL expects BigInt as string
  currentDeposit_lte?: string; // GraphQL expects BigInt as string
  deployedAtTimestamp_gte?: string; // GraphQL expects BigInt as string
  deployedAtTimestamp_lte?: string; // GraphQL expects BigInt as string
  revenue_gt?: string; // For isActive
}

/**
 * Typed where conditions for Pool entity
 * Updated to match new subgraph schema
 */
export interface PoolWhereInput {
  id?: string;
  poolId?: string; // GraphQL expects BigInt as string
  network?: NetworkName;
  paymaster_?: { address?: string };
  memberCount_gte?: string;
  memberCount_lte?: string;
  totalDeposits_gte?: string;
  totalDeposits_lte?: string;
  joiningFee_gte?: string;
  joiningFee_lte?: string;
  createdAtTimestamp_gte?: string;
  createdAtTimestamp_lte?: string;
  memberCount_gt?: string; // For hasMembers
  totalDeposits_gt?: string; // For isActive
}

/**
 * Typed where conditions for PoolMember entity
 * Updated to match new subgraph schema
 */
export interface PoolMemberWhereInput {
  id?: string;
  network?: NetworkName;
  pool_?: {
    id?: string;
    poolId?: string; // GraphQL expects BigInt as string for poolId
    paymaster_?: { address?: string };
  };
  memberIndex?: string; // GraphQL expects BigInt as string
  identityCommitment?: string; // GraphQL expects BigInt as string
  gasUsed_gte?: string;
  gasUsed_lte?: string;
  nullifierUsed?: boolean;
  addedAtTimestamp_gte?: string;
  addedAtTimestamp_lte?: string;
  rootIndexWhenAdded?: number;
}

/**
 * Typed where conditions for MerkleRoot entity
 * Updated from MerkleRootHistoryWhereInput
 */
export interface MerkleRootWhereInput {
  id?: string; // MerkleRoot's ID is often composite (e.g., poolId-rootIndex)
  pool?: string; // Directly filter by pool ID
  pool_in?: string[]; // For filtering by multiple pool IDs
  network?: NetworkName; // Directly filter by network
  network_in?: NetworkName[]; // For filtering by multiple networks
  rootIndex?: number;
  rootIndex_gte?: number;
  rootIndex_lte?: number;
  root?: string;
  root_in?: string[];
  createdAtTimestamp_gte?: string;
  createdAtTimestamp_lte?: string;
  createdAtBlock?: string;
  createdAtTransaction?: string;
}

/**
 * Typed where conditions for UserOperation entity
 */
export interface UserOperationWhereInput {
  id?: string; // network-userOpHash composite ID
  network?: NetworkName;
  userOpHash?: string;
  paymaster_?: {
    address?: string;
    contractType?: PaymasterType;
  };
  pool_?: { poolId?: string };
  sender?: string;
  nullifier?: string; // GraphQL expects BigInt as string
  actualGasCost_gte?: string; // GraphQL expects BigInt as string
  actualGasCost_lte?: string; // GraphQL expects BigInt as string
  gasPrice_gte?: string; // GraphQL expects BigInt as string
  gasPrice_lte?: string; // GraphQL expects BigInt as string
  executedAtTimestamp_gte?: string; // GraphQL expects BigInt as string
  executedAtTimestamp_lte?: string; // GraphQL expects BigInt as string
  executedAtBlock?: string; // GraphQL expects BigInt as string
  transactionHash?: string;
}

/**
 * Typed where conditions for RevenueWithdrawal entity
 */

export interface RevenueWithdrawalWhereInput {
  id?: string; // network-transactionHash-logIndex composite ID if available, otherwise consider ID from subgraph
  network?: NetworkName;
  paymaster_?: {
    address?: string;
    contractType?: PaymasterType;
  };
  recipient?: string;
  amount_gte?: string; // GraphQL expects BigInt as string
  amount_lte?: string; // GraphQL expects BigInt as string
  withdrawnAtTimestamp_gte?: string; // GraphQL expects BigInt as string
  withdrawnAtTimestamp_lte?: string; // GraphQL expects BigInt as string
  withdrawnAtBlock?: string; // GraphQL expects BigInt as string
  transactionHash?: string;
}

/**
 * Typed where conditions for NetworkInfo entity
 */
export interface NetworkInfoWhereInput {
  id?: NetworkName; // The ID is typically the network name in this entity
  totalPaymasters_gte?: string;
  totalPaymasters_lte?: string;
  totalPools_gte?: string;
  totalPools_lte?: string;
  totalMembers_gte?: string;
  totalMembers_lte?: string;
  totalUserOperations_gte?: string;
  totalUserOperations_lte?: string;
  totalGasSpent_gte?: string;
  totalGasSpent_lte?: string;
  totalRevenue_gte?: string;
  totalRevenue_lte?: string;
  firstDeploymentTimestamp_gte?: string;
  firstDeploymentTimestamp_lte?: string;
  lastActivityTimestamp_gte?: string;
  lastActivityTimestamp_lte?: string;
}

/**
 * Typed where conditions for NullifierUsage entity
 */
export interface NullifierUsageWhereInput {
  id?: string;
  nullifier?: string;
  nullifier_in?: string[];
  paymasterAddress?: string;
  paymasterAddress_in?: string[];
  paymasterType?: PaymasterType;
  paymasterType_in?: PaymasterType[];
  poolId?: string;
  poolId_in?: string[];
  network?: NetworkName;
  network_in?: NetworkName[];
  isUsed?: boolean;
  gasUsed_gte?: string;
  gasUsed_lte?: string;
  userOperation_not?: string; // To check if userOperation is not null/empty
  firstUsedAtTimestamp_gte?: string;
  firstUsedAtTimestamp_lte?: string;
  lastUpdatedTimestamp_gte?: string;
  lastUpdatedTimestamp_lte?: string;
  createdAtBlock?: string;
  createdAtBlock_gte?: string;
  createdAtBlock_lte?: string;
  createdAtTimestamp?: string;
  createdAtTimestamp_gte?: string;
  createdAtTimestamp_lte?: string;
}

/**
 * Typed where conditions for DailyPoolStats entity
 */
export interface DailyPoolStatsWhereInput {
  id?: string;
  poolId?: string;
  poolId_in?: string[];
  network?: NetworkName;
  network_in?: NetworkName[];
  date?: string;
  date_gte?: string;
  date_lte?: string;
  newMembers_gte?: string;
  newMembers_lte?: string;
  userOperations_gte?: string;
  userOperations_lte?: string;
  gasSpent_gte?: string;
  gasSpent_lte?: string;
  revenueGenerated_gte?: string;
  revenueGenerated_lte?: string;
  totalMembers_gte?: string;
  totalMembers_lte?: string;
  totalDeposits_gte?: string;
  totalDeposits_lte?: string;
  createdAtBlock?: string;
  createdAtBlock_gte?: string;
  createdAtBlock_lte?: string;
  createdAtTimestamp?: string;
  createdAtTimestamp_gte?: string;
  createdAtTimestamp_lte?: string;
}

/**
 * Typed where conditions for DailyGlobalStats entity
 */
export interface DailyGlobalStatsWhereInput {
  id?: string; // The ID of DailyGlobalStats is typically a combination of network and date (e.g., "base-sepolia-2024-01-01")
  network_in?: NetworkName[]; // For filtering by network (if the ID isn't directly the network)
  date?: string; // For a specific date query (if ID is not used for this)
  date_gte?: string;
  date_lte?: string;
  newPools_gte?: string;
  newPools_lte?: string;
  totalNewMembers_gte?: string;
  totalNewMembers_lte?: string;
  totalUserOperations_gte?: string;
  totalUserOperations_lte?: string;
  totalGasSpent_gte?: string;
  totalGasSpent_lte?: string;
  totalRevenueGenerated_gte?: string;
  totalRevenueGenerated_lte?: string;
  totalActivePools_gte?: string;
  totalActivePools_lte?: string;
  totalMembers_gte?: string;
  totalMembers_lte?: string;
}

/**
 * ========================================
 * UTILITY TYPES
 * ========================================
 */

/**
 * Simplified root history item (without full pool reference)
 * Updated to match new MerkleRoot structure
 */
export interface RootHistoryItem {
  id: string;
  root: string;
  rootIndex: number;
  createdAtTimestamp: string;
  createdAtBlock: string;
}

/**
 * Simplified user operation item (without full relationships)
 */
export interface UserOperationItem {
  id: string;
  userOpHash: string;
  sender: string;
  actualGasCost: string;
  nullifier: string;
  executedAtTimestamp: string;
  executedAtBlock: string;
}

/**
 * Simplified revenue withdrawal item (without full relationships)
 */
export interface RevenueWithdrawalItem {
  id: string;
  recipient: string;
  amount: string;
  withdrawnAtTimestamp: string;
  withdrawnAtBlock: string;
}

/**
 * Simplified daily stats item
 */
export interface DailyStatsItem {
  id: string;
  date: string;
  newMembers: string;
  userOperations: string;
  gasSpent: string;
  revenueGenerated: string;
  totalMembers: string;
  totalDeposits: string;
}

/**
 * Simplified global stats item
 */
export interface GlobalStatsItem {
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
 * Date range filter helper
 */
export interface DateRangeFilter {
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
}

/**
 * Pagination with cursor support
 */
export interface CursorPaginationOptions {
  /** Number of items to fetch */
  first?: number;
  /** Number of items to skip */
  skip?: number;
  /** Cursor for pagination */
  after?: string;
  /** Cursor for reverse pagination */
  before?: string;
}

/**
 * Enhanced pagination response
 */
export interface PaginatedResponse<T> {
  /** Query results */
  data: T[];
  /** Total count (if available) */
  totalCount?: number;
  /** Has more pages */
  hasMore: boolean;
  /** Next cursor */
  nextCursor?: string;
  /** Previous cursor */
  previousCursor?: string;
}
