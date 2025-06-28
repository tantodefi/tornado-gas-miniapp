//file:prepaid-gas-website/apps/web/types/pool.ts
/**
 * Pool-related type definitions
 * Single source of truth for all pool, member, and network types
 */

/**
 * Network configuration for a pool
 */
export interface PoolNetwork {
  name: string;
  chainId: number;
  chainName: string;
  networkName: string;
  contracts: {
    paymaster: string;
    verifier?: string;
  };
}

/**
 * Core Pool interface - matches API response format
 * All numeric values are strings due to BigInt serialization
 */
export interface Pool {
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
  network: PoolNetwork;
}

/**
 * Extended pool with member and root history data
 */
export interface DetailedPool extends Pool {
  members?: PoolMember[];
  rootHistory?: MerkleRootHistory[];
}

/**
 * Pool member information
 */
export interface PoolMember {
  id: string;
  identityCommitment: string;
  memberIndex: string;
  joinedAt: string;
  joinedAtBlock: string;
  isActive: boolean;
}

/**
 * Merkle root history entry
 */
export interface MerkleRootHistory {
  id: string;
  index: number;
  merkleRoot: string;
  createdAt: string;
  createdAtBlock: string;
  isValid: boolean;
  transactionHash: string;
}

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
 */
export interface PoolOverviewData {
  joiningFee: string;
  totalDeposits: string;
  membersCount: string;
  createdAt: string;
  network: PoolNetwork;
}

/**
 * Pool technical specifications for display
 */
export interface PoolTechnicalData {
  poolId: string;
  merkleTreeDuration: string;
  merkleTreeDepth: string;
  rootHistoryCount: number;
  currentRootIndex: number;
  membersCount: string;
  createdAtBlock: string;
  createdAt: string;
  network: PoolNetwork;
}

/**
 * Simplified member data for components
 */
export interface MemberData {
  id: string;
  identityCommitment: string;
  memberIndex: string;
  joinedAt: string;
  joinedAtBlock: string;
  isActive: boolean;
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
