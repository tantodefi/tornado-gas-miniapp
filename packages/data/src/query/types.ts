/**
 * Core query builder types and interfaces
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
 * Available fields for Pool entity queries
 * These match the Pool type from subgraph schema
 */
export type PoolFields =
  | "id"
  | "poolId"
  | "joiningFee"
  | "merkleTreeDuration"
  | "totalDeposits"
  | "currentMerkleTreeRoot"
  | "membersCount"
  | "merkleTreeDepth"
  | "createdAt"
  | "createdAtBlock"
  | "currentRootIndex"
  | "rootHistoryCount";

/**
 * Available fields for PoolMember entity queries
 * These match the PoolMember type from subgraph schema
 */
export type PoolMemberFields =
  | "id"
  | "identityCommitment"
  | "memberIndex"
  | "joinedAt"
  | "joinedAtBlock"
  | "isActive";

/**
 * Available fields for MerkleRootHistory entity queries
 * These match the MerkleRootHistory type from subgraph schema
 */
export type MerkleRootHistoryFields =
  | "id"
  | "index"
  | "merkleRoot"
  | "createdAt"
  | "createdAtBlock"
  | "isValid"
  | "transactionHash";

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
 * Typed where conditions for Pool entity
 * Maps Pool fields to appropriate where conditions
 */
/**
 * Typed where conditions for Pool entity
 * Uses direct subgraph format (no transformation needed)
 */
export type PoolWhereInput = Partial<{
  // Direct field matches
  poolId: string;

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

  membersCount_gte: string;
  membersCount_lte: string;
  membersCount_gt: string;
  membersCount_lt: string;
  membersCount_in: string[];

  createdAt_gte: string;
  createdAt_lte: string;
  createdAt_gt: string;
  createdAt_lt: string;

  merkleTreeDepth_gte: string;
  merkleTreeDepth_lte: string;

  merkleTreeDuration_gte: string;
  merkleTreeDuration_lte: string;

  // Text search operators
  poolId_contains: string;
  poolId_not_contains: string;
  poolId_starts_with: string;
  poolId_ends_with: string;
  poolId_in: string[];
  poolId_not_in: string[];
}>;

/**
 * Typed where conditions for PoolMember entity
 * Uses direct subgraph format (no transformation needed)
 */
export type PoolMemberWhereInput = Partial<{
  // Direct field matches
  pool: string; // Pool ID filter
  identityCommitment: string; // Exact identity match
  memberIndex: string; // Exact member index
  joinedAt: string; // Exact join timestamp
  joinedAtBlock: string; // Exact block number
  isActive: boolean; // Active status

  // Range operators for numeric/string fields
  memberIndex_gte: string;
  memberIndex_lte: string;
  memberIndex_gt: string;
  memberIndex_lt: string;
  memberIndex_in: string[];

  joinedAt_gte: string;
  joinedAt_lte: string;
  joinedAt_gt: string;
  joinedAt_lt: string;

  joinedAtBlock_gte: string;
  joinedAtBlock_lte: string;
  joinedAtBlock_gt: string;
  joinedAtBlock_lt: string;

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
  isActive_not: boolean; // Negation of isActive
}>;

/**
 * Typed where conditions for MerkleRootHistory entity
 * Maps MerkleRootHistory fields to appropriate where conditions
 */
export type MerkleRootHistoryWhereInput = Partial<{
  index: WhereCondition<number>;
  merkleRoot: WhereCondition<string>;
  createdAt: WhereCondition<string>;
  createdAtBlock: WhereCondition<string>;
  isValid: WhereCondition<boolean>;
}>;

/**
 * Simplified root history item (without full pool reference)
 */
export interface RootHistoryItem {
  index: number;
  merkleRoot: string;
  createdAt: string;
  createdAtBlock: string;
  isValid?: boolean;
}
