/**
 * Core subgraph entity types - exact match to GraphQL schema
 * These types represent the raw data structure from The Graph Protocol
 */

/**
 * Pool entity from subgraph
 * Represents a gas payment pool with all members and configuration
 */
export interface Pool {
  /** Pool ID as string (GraphQL ID) */
  id: string;
  /** Pool ID as BigInt */
  poolId: bigint;
  /** Fee required to join this pool (in wei) */
  joiningFee: bigint;
  /** Duration for which Merkle tree roots remain valid */
  merkleTreeDuration: bigint;
  /** Total deposits in this pool (in wei) */
  totalDeposits: bigint;
  /** Current Merkle tree root */
  currentMerkleTreeRoot: bigint;
  /** Number of members in the pool */
  membersCount: bigint;
  /** Depth of the Merkle tree */
  merkleTreeDepth: bigint;
  /** Timestamp when pool was created */
  createdAt: bigint;
  /** Block number when pool was created */
  createdAtBlock: bigint;
  /** Current index in the root history circular buffer */
  currentRootIndex: number;
  /** Number of roots stored in history */
  rootHistoryCount: number;
  /** Derived field - pool members */
  members: PoolMember[];
  /** Derived field - root history */
  rootHistory: MerkleRootHistory[];
}

/**
 * Pool member entity from subgraph
 */
export interface PoolMember {
  /** Unique ID: poolId-memberIndex */
  id: string;
  /** Reference to the pool */
  pool: Pool;
  /** Member's identity commitment */
  identityCommitment: string;
  /** Member's index in the pool */
  memberIndex: string;
  /** Timestamp when member joined */
  joinedAt: string;
  /** Block number when member joined */
  joinedAtBlock: string;
  /** Whether member is still active */
  isActive: boolean;
}

/**
 * Merkle root history entity from subgraph
 */
export interface MerkleRootHistory {
  /** Unique ID: poolId-index */
  id: string;
  /** Reference to the pool */
  pool: Pool;
  /** Index in the root history circular buffer */
  index: number;
  /** The Merkle root value */
  merkleRoot: bigint;
  /** Timestamp when root was created */
  createdAt: bigint;
  /** Block number when root was created */
  createdAtBlock: bigint;
  /** Whether root is still in the valid 64-root window */
  isValid: boolean;
  /** Transaction hash where root was created */
  transactionHash: string;
}

/**
 * Event entities - immutable event records
 */
export interface PoolCreatedEvent {
  id: string;
  poolId: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface MemberAddedEvent {
  id: string;
  poolId: bigint;
  index: bigint;
  identityCommitment: bigint;
  merkleTreeRoot: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface MembersAddedEvent {
  id: string;
  poolId: bigint;
  startIndex: bigint;
  identityCommitments: bigint[];
  merkleTreeRoot: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface OwnershipTransferredEvent {
  id: string;
  previousOwner: string;
  newOwner: string;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

/**
 * Network metadata that accompanies subgraph responses
 */
export interface NetworkMetadata {
  network: string;
  chainId: number;
  chainName: string;
  networkName: string;
  contracts: {
    paymaster: string;
    verifier?: string;
  };
}

/**
 * Response wrapper for subgraph queries
 */
export interface SubgraphResponse<T> {
  data: T;
  meta: NetworkMetadata;
}
