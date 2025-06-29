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
export type PoolWhereInput = Partial<{
  poolId: WhereCondition<string>;
  joiningFee: WhereCondition<string>;
  totalDeposits: WhereCondition<string>;
  membersCount: WhereCondition<string>;
  createdAt: WhereCondition<string>;
  merkleTreeDepth: WhereCondition<string>;
  merkleTreeDuration: WhereCondition<string>;
}>;

/**
 * Typed where conditions for PoolMember entity
 * Maps PoolMember fields to appropriate where conditions
 */
export type PoolMemberWhereInput = Partial<{
  identityCommitment: WhereCondition<string>;
  memberIndex: WhereCondition<string>;
  joinedAt: WhereCondition<string>;
  joinedAtBlock: WhereCondition<string>;
  isActive: WhereCondition<boolean>;
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
