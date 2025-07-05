//file:prepaid-gas-website/apps/web/types/pool.ts
/**
 * Pool-related type definitions
 * Simplified to directly use @workspace/data package types
 */

import type {
  SerializedPool,
  SerializedPoolMember,
  SerializedMerkleRoot,
  NetworkMetadata,
} from "@workspace/data";

/**
 * ========================================
 * CORE TYPES - Direct from Data Package
 * ========================================
 */

/**
 * Pool type for web app - directly uses serialized data package type
 * Network info is already included in the data package
 */
export type Pool = SerializedPool;

/**
 * Pool member type for web app - directly uses serialized data package type
 */
export type PoolMember = SerializedPoolMember;

/**
 * Merkle root history - directly uses serialized data package type
 */
export type MerkleRootHistory = SerializedMerkleRoot;

/**
 * DetailedPool is just an alias for Pool since SerializedPool
 * already includes members and merkleRoots
 */
export type DetailedPool = Pool;

/**
 * Network configuration - directly uses data package type
 */
export type PoolNetwork = string;

/**
 * ========================================
 * UI/DISPLAY HELPER TYPES
 * ========================================
 */

/**
 * Filter state for pool filtering and sorting
 */
export interface FilterState {
  network: string;
  amountRange: string;
  memberRange: string;
  sortBy: string;
}

/**
 * Pool overview data for display components
 * Updated to use new field names from data package
 */
export interface PoolOverviewData {
  joiningFee: string;
  totalDeposits: string;
  memberCount: string; // Updated from membersCount
  createdAtTimestamp: string; // Updated from createdAt
  network: string; // Simplified to just network name
}

/**
 * Pool technical specifications for display
 */
export type PoolTechnicalData = Pool;

/**
 * Simplified member data for components
 * Updated to use new field names from data package
 */
export interface MemberData {
  id: string;
  identityCommitment: string;
  memberIndex: string;
  addedAtTimestamp: string; // Updated from joinedAt
  addedAtBlock: string; // Updated from joinedAtBlock
}

/**
 * Pool statistics for display
 */
export interface PoolStats {
  totalPools: number;
  totalMembers: number;
  totalValue: string;
  averagePoolSize: number;
}

/**
 * ========================================
 * QUERY AND FILTER TYPES
 * ========================================
 */

/**
 * Pool query options
 */
export interface PoolQueryOptions {
  page?: number;
  limit?: number;
  maxResults?: number;
  paginated?: boolean;
  fields?: string[];
}

/**
 * Pool search and filter options
 */
export interface PoolSearchOptions {
  query?: string;
  network?: string;
  minFee?: string;
  maxFee?: string;
  minMembers?: number;
  maxMembers?: number;
  sortBy?:
    | "newest"
    | "amount-high"
    | "amount-low"
    | "members-high"
    | "members-low";
}
