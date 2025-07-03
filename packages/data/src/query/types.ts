/**
 * Core query builder types and interfaces
 * Updated for new subgraph schema structure
 */

/**
 * Base query configuration for GraphQL queries
 */
export interface QueryConfig {
  /** Number of items to fetch */
  first?: number;
  /** Number of items to skip (for pagination) */
  skip?: number;
  /** Field to order by */
  orderBy?: string;
  /** Order direction */
  orderDirection?: "asc" | "desc";
  /** Where conditions */
  where?: Record<string, any>;
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
  | "id"
  | "contractType"
  | "address"
  | "totalUsersDeposit"
  | "currentDeposit"
  | "revenue"
  | "deployedAtBlock"
  | "deployedAtTransaction"
  | "deployedAtTimestamp"
  | "lastUpdatedBlock"
  | "lastUpdatedTimestamp";

/**
 * Available fields for Pool entity queries
 * Updated to match new subgraph schema
 */
export type PoolFields =
  | "id"
  | "poolId"
  | "joiningFee"
  | "totalDeposits"
  | "memberCount"
  | "currentMerkleRoot"
  | "currentRootIndex"
  | "rootHistoryCount"
  | "createdAtBlock"
  | "createdAtTransaction"
  | "createdAtTimestamp"
  | "lastUpdatedBlock"
  | "lastUpdatedTimestamp";

/**
 * Available fields for PoolMember entity queries
 * Updated to match new subgraph schema
 */
export type PoolMemberFields =
  | "id"
  | "memberIndex"
  | "identityCommitment"
  | "merkleRootWhenAdded"
  | "rootIndexWhenAdded"
  | "addedAtBlock"
  | "addedAtTransaction"
  | "addedAtTimestamp"
  | "gasUsed"
  | "nullifierUsed"
  | "nullifier";

/**
 * Available fields for MerkleRoot entity queries
 * Updated from MerkleRootHistoryFields
 */
export type MerkleRootFields =
  | "id"
  | "root"
  | "rootIndex"
  | "createdAtBlock"
  | "createdAtTransaction"
  | "createdAtTimestamp";

/**
 * Available fields for UserOperation entity queries
 */
export type UserOperationFields =
  | "id"
  | "userOpHash"
  | "sender"
  | "actualGasCost"
  | "nullifier"
  | "executedAtBlock"
  | "executedAtTransaction"
  | "executedAtTimestamp"
  | "gasPrice"
  | "totalGasUsed";

/**
 * Available fields for RevenueWithdrawal entity queries
 */
export type RevenueWithdrawalFields =
  | "id"
  | "recipient"
  | "amount"
  | "withdrawnAtBlock"
  | "withdrawnAtTransaction"
  | "withdrawnAtTimestamp";

/**
 * Available fields for NullifierUsage entity queries
 */
export type NullifierUsageFields =
  | "id"
  | "nullifier"
  | "isUsed"
  | "gasUsed"
  | "firstUsedAtBlock"
  | "firstUsedAtTransaction"
  | "firstUsedAtTimestamp"
  | "lastUpdatedBlock"
  | "lastUpdatedTimestamp";

/**
 * Available fields for DailyPoolStats entity queries
 */
export type DailyPoolStatsFields =
  | "id"
  | "date"
  | "newMembers"
  | "userOperations"
  | "gasSpent"
  | "revenueGenerated"
  | "totalMembers"
  | "totalDeposits";

/**
 * Available fields for DailyGlobalStats entity queries
 */
export type DailyGlobalStatsFields =
  | "id"
  | "date"
  | "newPools"
  | "totalNewMembers"
  | "totalUserOperations"
  | "totalGasSpent"
  | "totalRevenueGenerated"
  | "totalActivePools"
  | "totalMembers";

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
export type PaymasterContractWhereInput = Partial<{
  // Direct field matches
  id: string;
  contractType: string;
  address: string;

  // Range operators for numeric fields
  totalUsersDeposit_gte: string;
  totalUsersDeposit_lte: string;
  totalUsersDeposit_gt: string;
  totalUsersDeposit_lt: string;

  currentDeposit_gte: string;
  currentDeposit_lte: string;
  currentDeposit_gt: string;
  currentDeposit_lt: string;

  revenue_gte: string;
  revenue_lte: string;
  revenue_gt: string;
  revenue_lt: string;

  deployedAtTimestamp_gte: string;
  deployedAtTimestamp_lte: string;
  deployedAtTimestamp_gt: string;
  deployedAtTimestamp_lt: string;

  // Text search operators
  contractType_in: string[];
  contractType_not_in: string[];
  address_in: string[];
  address_not_in: string[];
  address_contains: string;
  address_not_contains: string;
}>;

/**
 * Typed where conditions for Pool entity
 * Updated to match new subgraph schema
 */
export type PoolWhereInput = Partial<{
  // Direct field matches
  id: string;
  poolId: string;
  paymaster: string; // PaymasterContract ID filter

  // Range operators for numeric/string fields
  joiningFee_gte: string;
  joiningFee_lte: string;
  joiningFee_gt: string;
  joiningFee_lt: string;
  joiningFee_in: string[];

  totalDeposits_gte: string;
  totalDeposits_lte: string;
  totalDeposits_gt: string;
  totalDeposits_lt: string;

  memberCount_gte: string;
  memberCount_lte: string;
  memberCount_gt: string;
  memberCount_lt: string;
  memberCount_in: string[];

  createdAtTimestamp_gte: string;
  createdAtTimestamp_lte: string;
  createdAtTimestamp_gt: string;
  createdAtTimestamp_lt: string;

  currentMerkleRoot_gte: string;
  currentMerkleRoot_lte: string;
  currentMerkleRoot_gt: string;
  currentMerkleRoot_lt: string;

  // Text search operators
  poolId_contains: string;
  poolId_not_contains: string;
  poolId_starts_with: string;
  poolId_ends_with: string;
  poolId_in: string[];
  poolId_not_in: string[];

  // Paymaster filtering
  paymaster_in: string[]; // Multiple paymaster IDs
  paymaster_not_in: string[]; // Exclude paymaster IDs
}>;

/**
 * Typed where conditions for PoolMember entity
 * Updated to match new subgraph schema
 */
export type PoolMemberWhereInput = Partial<{
  // Direct field matches
  id: string;
  pool: string; // Pool ID filter
  identityCommitment: string; // Exact identity match
  memberIndex: string; // Exact member index
  addedAtTimestamp: string; // Exact timestamp
  addedAtBlock: string; // Exact block number

  // Range operators for numeric fields
  memberIndex_gte: string;
  memberIndex_lte: string;
  memberIndex_gt: string;
  memberIndex_lt: string;
  memberIndex_in: string[];

  addedAtTimestamp_gte: string;
  addedAtTimestamp_lte: string;
  addedAtTimestamp_gt: string;
  addedAtTimestamp_lt: string;

  addedAtBlock_gte: string;
  addedAtBlock_lte: string;
  addedAtBlock_gt: string;
  addedAtBlock_lt: string;

  gasUsed_gte: string;
  gasUsed_lte: string;
  gasUsed_gt: string;
  gasUsed_lt: string;

  // Text search operators for identity commitment
  identityCommitment_contains: string;
  identityCommitment_not_contains: string;
  identityCommitment_starts_with: string;
  identityCommitment_ends_with: string;
  identityCommitment_in: string[];
  identityCommitment_not_in: string[];

  // Pool filtering
  pool_in: string[]; // Multiple pool IDs
  pool_not_in: string[]; // Exclude pool IDs

  // Boolean operators
  nullifierUsed: boolean;
  nullifierUsed_not: boolean;
}>;

/**
 * Typed where conditions for MerkleRoot entity
 * Updated from MerkleRootHistoryWhereInput
 */
export type MerkleRootWhereInput = Partial<{
  // Direct field matches
  id: string;
  pool: string; // Pool ID filter
  root: string; // Exact root match
  rootIndex: number; // Exact root index

  // Range operators for numeric fields
  rootIndex_gte: number;
  rootIndex_lte: number;
  rootIndex_gt: number;
  rootIndex_lt: number;
  rootIndex_in: number[];

  createdAtTimestamp_gte: string;
  createdAtTimestamp_lte: string;
  createdAtTimestamp_gt: string;
  createdAtTimestamp_lt: string;

  createdAtBlock_gte: string;
  createdAtBlock_lte: string;
  createdAtBlock_gt: string;
  createdAtBlock_lt: string;

  // Text search operators for root
  root_contains: string;
  root_not_contains: string;
  root_starts_with: string;
  root_ends_with: string;
  root_in: string[];
  root_not_in: string[];

  // Pool filtering
  pool_in: string[]; // Multiple pool IDs
  pool_not_in: string[]; // Exclude pool IDs
}>;

/**
 * Typed where conditions for UserOperation entity
 */
export type UserOperationWhereInput = Partial<{
  // Direct field matches
  id: string;
  userOpHash: string;
  paymaster: string; // PaymasterContract ID filter
  pool: string; // Pool ID filter
  sender: string; // Exact sender match
  nullifier: string; // Exact nullifier match

  // Range operators for numeric fields
  actualGasCost_gte: string;
  actualGasCost_lte: string;
  actualGasCost_gt: string;
  actualGasCost_lt: string;

  gasPrice_gte: string;
  gasPrice_lte: string;
  gasPrice_gt: string;
  gasPrice_lt: string;

  totalGasUsed_gte: string;
  totalGasUsed_lte: string;
  totalGasUsed_gt: string;
  totalGasUsed_lt: string;

  executedAtTimestamp_gte: string;
  executedAtTimestamp_lte: string;
  executedAtTimestamp_gt: string;
  executedAtTimestamp_lt: string;

  executedAtBlock_gte: string;
  executedAtBlock_lte: string;
  executedAtBlock_gt: string;
  executedAtBlock_lt: string;

  // Text search operators
  userOpHash_contains: string;
  userOpHash_not_contains: string;
  userOpHash_starts_with: string;
  userOpHash_ends_with: string;
  userOpHash_in: string[];
  userOpHash_not_in: string[];

  sender_contains: string;
  sender_not_contains: string;
  sender_starts_with: string;
  sender_ends_with: string;
  sender_in: string[];
  sender_not_in: string[];

  // Filtering by related entities
  paymaster_in: string[]; // Multiple paymaster IDs
  paymaster_not_in: string[]; // Exclude paymaster IDs
  pool_in: string[]; // Multiple pool IDs
  pool_not_in: string[]; // Exclude pool IDs
}>;

/**
 * Typed where conditions for RevenueWithdrawal entity
 */
export type RevenueWithdrawalWhereInput = Partial<{
  // Direct field matches
  id: string;
  paymaster: string; // PaymasterContract ID filter
  recipient: string; // Exact recipient match

  // Range operators for numeric fields
  amount_gte: string;
  amount_lte: string;
  amount_gt: string;
  amount_lt: string;

  withdrawnAtTimestamp_gte: string;
  withdrawnAtTimestamp_lte: string;
  withdrawnAtTimestamp_gt: string;
  withdrawnAtTimestamp_lt: string;

  withdrawnAtBlock_gte: string;
  withdrawnAtBlock_lte: string;
  withdrawnAtBlock_gt: string;
  withdrawnAtBlock_lt: string;

  // Text search operators
  recipient_contains: string;
  recipient_not_contains: string;
  recipient_starts_with: string;
  recipient_ends_with: string;
  recipient_in: string[];
  recipient_not_in: string[];

  // Filtering by related entities
  paymaster_in: string[]; // Multiple paymaster IDs
  paymaster_not_in: string[]; // Exclude paymaster IDs
}>;

/**
 * Typed where conditions for NullifierUsage entity
 */
export type NullifierUsageWhereInput = Partial<{
  // Direct field matches
  id: string;
  nullifier: string; // Exact nullifier match
  paymaster: string; // PaymasterContract ID filter
  pool: string; // Pool ID filter
  isUsed: boolean; // Boolean filter

  // Range operators for numeric fields
  gasUsed_gte: string;
  gasUsed_lte: string;
  gasUsed_gt: string;
  gasUsed_lt: string;

  firstUsedAtTimestamp_gte: string;
  firstUsedAtTimestamp_lte: string;
  firstUsedAtTimestamp_gt: string;
  firstUsedAtTimestamp_lt: string;

  lastUpdatedTimestamp_gte: string;
  lastUpdatedTimestamp_lte: string;
  lastUpdatedTimestamp_gt: string;
  lastUpdatedTimestamp_lt: string;

  // Text search operators
  nullifier_contains: string;
  nullifier_not_contains: string;
  nullifier_starts_with: string;
  nullifier_ends_with: string;
  nullifier_in: string[];
  nullifier_not_in: string[];

  // Boolean operators
  isUsed_not: boolean;

  // Filtering by related entities
  paymaster_in: string[]; // Multiple paymaster IDs
  paymaster_not_in: string[]; // Exclude paymaster IDs
  pool_in: string[]; // Multiple pool IDs
  pool_not_in: string[]; // Exclude pool IDs
}>;

/**
 * Typed where conditions for DailyPoolStats entity
 */
export type DailyPoolStatsWhereInput = Partial<{
  // Direct field matches
  id: string;
  date: string; // Exact date match (YYYY-MM-DD)
  pool: string; // Pool ID filter

  // Range operators for numeric fields
  newMembers_gte: string;
  newMembers_lte: string;
  newMembers_gt: string;
  newMembers_lt: string;

  userOperations_gte: string;
  userOperations_lte: string;
  userOperations_gt: string;
  userOperations_lt: string;

  gasSpent_gte: string;
  gasSpent_lte: string;
  gasSpent_gt: string;
  gasSpent_lt: string;

  revenueGenerated_gte: string;
  revenueGenerated_lte: string;
  revenueGenerated_gt: string;
  revenueGenerated_lt: string;

  totalMembers_gte: string;
  totalMembers_lte: string;
  totalMembers_gt: string;
  totalMembers_lt: string;

  totalDeposits_gte: string;
  totalDeposits_lte: string;
  totalDeposits_gt: string;
  totalDeposits_lt: string;

  // Date range operators
  date_gte: string; // Date greater than or equal
  date_lte: string; // Date less than or equal
  date_gt: string; // Date greater than
  date_lt: string; // Date less than
  date_in: string[]; // Multiple dates
  date_not_in: string[]; // Exclude dates

  // Filtering by related entities
  pool_in: string[]; // Multiple pool IDs
  pool_not_in: string[]; // Exclude pool IDs
}>;

/**
 * Typed where conditions for DailyGlobalStats entity
 */
export type DailyGlobalStatsWhereInput = Partial<{
  // Direct field matches
  id: string;
  date: string; // Exact date match (YYYY-MM-DD)

  // Range operators for numeric fields
  newPools_gte: string;
  newPools_lte: string;
  newPools_gt: string;
  newPools_lt: string;

  totalNewMembers_gte: string;
  totalNewMembers_lte: string;
  totalNewMembers_gt: string;
  totalNewMembers_lt: string;

  totalUserOperations_gte: string;
  totalUserOperations_lte: string;
  totalUserOperations_gt: string;
  totalUserOperations_lt: string;

  totalGasSpent_gte: string;
  totalGasSpent_lte: string;
  totalGasSpent_gt: string;
  totalGasSpent_lt: string;

  totalRevenueGenerated_gte: string;
  totalRevenueGenerated_lte: string;
  totalRevenueGenerated_gt: string;
  totalRevenueGenerated_lt: string;

  totalActivePools_gte: string;
  totalActivePools_lte: string;
  totalActivePools_gt: string;
  totalActivePools_lt: string;

  totalMembers_gte: string;
  totalMembers_lte: string;
  totalMembers_gt: string;
  totalMembers_lt: string;

  // Date range operators
  date_gte: string; // Date greater than or equal
  date_lte: string; // Date less than or equal
  date_gt: string; // Date greater than
  date_lt: string; // Date less than
  date_in: string[]; // Multiple dates
  date_not_in: string[]; // Exclude dates
}>;

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
