/**
 * TypeScript type definitions for the prepaid gas paymaster subgraph
 * Updated to match the new network-aware schema structure
 *
 * These types exactly match the GraphQL schema entities and support:
 * - Multi-network/multi-chain deployments
 * - Enhanced nullifier usage tracking
 * - Comprehensive analytics and revenue tracking
 * - Network-aware entity relationships
 */

/**
 * ========================================
 * CORE ENTITY TYPES (exact match to schema)
 * ========================================
 */

/**
 * Paymaster contract types
 */
export type PaymasterType = "GasLimited" | "OneTimeUse";

/**
 * PaymasterContract entity
 * Represents a deployed paymaster contract on a specific network
 */
export interface PaymasterContract {
  /** Contract address as ID (network-prefixed) */
  id: string;
  /** Contract type: "GasLimited" or "OneTimeUse" */
  contractType: PaymasterType;
  /** Contract address */
  address: string;
  /** Network/Chain identifier (e.g., "base-sepolia") */
  network: string;
  /** Chain ID (e.g., 84532 for Base Sepolia) */
  chainId: bigint;
  /** Total user deposits tracked by this paymaster */
  totalUsersDeposit: bigint;
  /** Current deposit in EntryPoint */
  currentDeposit: bigint;
  /** Calculated revenue (currentDeposit - totalUsersDeposit) */
  revenue: bigint;
  /** Block when contract was deployed */
  deployedAtBlock: bigint;
  /** Transaction hash of deployment */
  deployedAtTransaction: string;
  /** Timestamp of deployment */
  deployedAtTimestamp: bigint;
  /** Pools managed by this paymaster */
  pools: Pool[];
  /** User operations sponsored by this paymaster */
  userOperations: UserOperation[];
  /** Revenue withdrawals from this paymaster */
  revenueWithdrawals: RevenueWithdrawal[];
  /** Last updated block */
  lastUpdatedBlock: bigint;
  /** Last updated timestamp */
  lastUpdatedTimestamp: bigint;
}

/**
 * Pool entity
 * Represents a gas payment pool managed by a paymaster
 */
export interface Pool {
  /** Pool ID as string (network-prefixed) */
  id: string;
  /** Numeric pool ID */
  poolId: bigint;
  /** Paymaster contract that manages this pool */
  paymaster: PaymasterContract;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Fee required to join this pool */
  joiningFee: bigint;
  /** Total deposits in this pool */
  totalDeposits: bigint;
  /** Current number of members */
  memberCount: bigint;
  /** Current Merkle tree root */
  currentMerkleRoot: bigint;
  /** Current root index in history */
  currentRootIndex: number;
  /** Total number of roots in history */
  rootHistoryCount: number;
  /** Block when pool was created */
  createdAtBlock: bigint;
  /** Transaction hash of creation */
  createdAtTransaction: string;
  /** Timestamp of creation */
  createdAtTimestamp: bigint;
  /** Pool members */
  members: PoolMember[];
  /** User operations from this pool */
  userOperations: UserOperation[];
  /** Merkle root history */
  merkleRoots: MerkleRoot[];
  /** Last updated block */
  lastUpdatedBlock: bigint;
  /** Last updated timestamp */
  lastUpdatedTimestamp: bigint;
}

/**
 * PoolMember entity
 * Represents a member of a gas payment pool
 */
export interface PoolMember {
  /** Pool ID + Member Index as ID (network-prefixed) */
  id: string;
  /** Pool this member belongs to */
  pool: Pool;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Member index in the pool */
  memberIndex: bigint;
  /** Identity commitment */
  identityCommitment: bigint;
  /** Merkle root when member was added */
  merkleRootWhenAdded: bigint;
  /** Root index when member was added */
  rootIndexWhenAdded: number;
  /** Block when member was added */
  addedAtBlock: bigint;
  /** Transaction hash of addition */
  addedAtTransaction: string;
  /** Timestamp of addition */
  addedAtTimestamp: bigint;
  /** For GasLimited: track gas usage (if applicable) */
  gasUsed?: bigint;
  /** For OneTimeUse: track if nullifier was used */
  nullifierUsed?: boolean;
  /** Nullifier value (if known) */
  nullifier?: bigint;
}

/**
 * MerkleRoot entity
 * Represents a Merkle root in a pool's history
 */
export interface MerkleRoot {
  /** Pool ID + Root Index as ID (network-prefixed) */
  id: string;
  /** Pool this root belongs to */
  pool: Pool;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Root value */
  root: bigint;
  /** Index in the history */
  rootIndex: number;
  /** Block when root was created */
  createdAtBlock: bigint;
  /** Transaction hash when root was created */
  createdAtTransaction: string;
  /** Timestamp when root was created */
  createdAtTimestamp: bigint;
}

/**
 * UserOperation entity
 * Represents a sponsored user operation
 */
export interface UserOperation {
  /** User operation hash as ID (network-prefixed) */
  id: string;
  /** User operation hash */
  userOpHash: string;
  /** Paymaster that sponsored this operation */
  paymaster: PaymasterContract;
  /** Pool used for this operation */
  pool: Pool;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Sender of the user operation */
  sender: string;
  /** Actual gas cost for this operation */
  actualGasCost: bigint;
  /** Nullifier used (for tracking) */
  nullifier: bigint;
  /** Block when operation was executed */
  executedAtBlock: bigint;
  /** Transaction hash of execution */
  executedAtTransaction: string;
  /** Timestamp of execution */
  executedAtTimestamp: bigint;
  /** Gas price used */
  gasPrice?: bigint;
  /** Total gas used (including postOp) */
  totalGasUsed?: bigint;
}

/**
 * RevenueWithdrawal entity
 * Represents a revenue withdrawal from a paymaster
 */
export interface RevenueWithdrawal {
  /** Transaction hash + log index as ID (network-prefixed) */
  id: string;
  /** Paymaster that withdrew revenue */
  paymaster: PaymasterContract;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Recipient of the withdrawal */
  recipient: string;
  /** Amount withdrawn */
  amount: bigint;
  /** Block of withdrawal */
  withdrawnAtBlock: bigint;
  /** Transaction hash of withdrawal */
  withdrawnAtTransaction: string;
  /** Timestamp of withdrawal */
  withdrawnAtTimestamp: bigint;
}

/**
 * Enhanced NullifierUsage entity
 * Tracks nullifier usage across different paymaster types
 */
export interface NullifierUsage {
  /** Nullifier as ID (network-prefixed) */
  id: string;
  /** Nullifier value */
  nullifier: bigint;
  /** Paymaster contract */
  paymaster: PaymasterContract;
  /** Pool where nullifier was used */
  pool: Pool;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Whether nullifier is used (for OneTimeUse) */
  isUsed: boolean;
  /** Gas used by this nullifier (for GasLimited) */
  gasUsed: bigint;
  /** User operation that used this nullifier */
  userOperation?: UserOperation;
  /** Block when first used */
  firstUsedAtBlock?: bigint;
  /** Transaction hash when first used */
  firstUsedAtTransaction?: string;
  /** Timestamp when first used */
  firstUsedAtTimestamp?: bigint;
  /** Last updated block */
  lastUpdatedBlock: bigint;
  /** Last updated timestamp */
  lastUpdatedTimestamp: bigint;
}

/**
 * DailyPoolStats entity
 * Daily aggregated statistics for a pool
 */
export interface DailyPoolStats {
  /** Date (YYYY-MM-DD) + Pool ID as ID (network-prefixed) */
  id: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Pool */
  pool: Pool;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Daily new members */
  newMembers: bigint;
  /** Daily user operations */
  userOperations: bigint;
  /** Daily gas spent */
  gasSpent: bigint;
  /** Daily revenue generated */
  revenueGenerated: bigint;
  /** Total members at end of day */
  totalMembers: bigint;
  /** Total deposits at end of day */
  totalDeposits: bigint;
}

/**
 * DailyGlobalStats entity
 * Global daily statistics across all paymasters
 */
export interface DailyGlobalStats {
  /** Date (YYYY-MM-DD) + Network as ID (network-prefixed) */
  id: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Network/Chain identifier */
  network: string;
  /** Chain ID */
  chainId: bigint;
  /** Total pools created this day */
  newPools: bigint;
  /** Total new members across all pools */
  totalNewMembers: bigint;
  /** Total user operations across all paymasters */
  totalUserOperations: bigint;
  /** Total gas spent across all paymasters */
  totalGasSpent: bigint;
  /** Total revenue generated across all paymasters */
  totalRevenueGenerated: bigint;
  /** Total active pools */
  totalActivePools: bigint;
  /** Total members across all pools */
  totalMembers: bigint;
}

/**
 * NetworkInfo entity
 * Network/Chain information and statistics
 */
export interface NetworkInfo {
  /** Network identifier as ID */
  id: string;
  /** Network name (e.g., "Base Sepolia") */
  name: string;
  /** Chain ID */
  chainId: bigint;
  /** Total paymasters deployed on this network */
  totalPaymasters: bigint;
  /** Total pools across all paymasters */
  totalPools: bigint;
  /** Total members across all pools */
  totalMembers: bigint;
  /** Total user operations */
  totalUserOperations: bigint;
  /** Total gas spent */
  totalGasSpent: bigint;
  /** Total revenue generated */
  totalRevenue: bigint;
  /** First deployment block */
  firstDeploymentBlock: bigint;
  /** First deployment timestamp */
  firstDeploymentTimestamp: bigint;
  /** Last activity block */
  lastActivityBlock: bigint;
  /** Last activity timestamp */
  lastActivityTimestamp: bigint;
}

/**
 * ========================================
 * EVENT TYPES (based on mapping files)
 * ========================================
 */

/**
 * Pool creation event
 */
export interface PoolCreatedEvent {
  /** Pool ID */
  poolId: bigint;
  /** Joining fee for the pool */
  joiningFee: bigint;
  /** Block information */
  block: {
    number: bigint;
    timestamp: bigint;
  };
  /** Transaction information */
  transaction: {
    hash: string;
  };
}

/**
 * Member addition event
 */
export interface MemberAddedEvent {
  /** Pool ID */
  poolId: bigint;
  /** Member index */
  memberIndex: bigint;
  /** Identity commitment */
  identityCommitment: bigint;
  /** Merkle tree root */
  merkleTreeRoot: bigint;
  /** Merkle root index */
  merkleRootIndex: bigint;
  /** Block information */
  block: {
    number: bigint;
    timestamp: bigint;
  };
  /** Transaction information */
  transaction: {
    hash: string;
  };
}

/**
 * Multiple members addition event
 */
export interface MembersAddedEvent {
  /** Pool ID */
  poolId: bigint;
  /** Starting member index */
  startIndex: bigint;
  /** Array of identity commitments */
  identityCommitments: bigint[];
  /** Merkle tree root */
  merkleTreeRoot: bigint;
  /** Merkle root index */
  merkleRootIndex: bigint;
  /** Block information */
  block: {
    number: bigint;
    timestamp: bigint;
  };
  /** Transaction information */
  transaction: {
    hash: string;
  };
}

/**
 * User operation sponsored event
 */
export interface UserOpSponsoredEvent {
  /** User operation hash */
  userOpHash: string;
  /** Pool ID */
  poolId: bigint;
  /** Sender address */
  sender: string;
  /** Actual gas cost */
  actualGasCost: bigint;
  /** Nullifier used */
  nullifier: bigint;
  /** Block information */
  block: {
    number: bigint;
    timestamp: bigint;
  };
  /** Transaction information */
  transaction: {
    hash: string;
  };
}

/**
 * Revenue withdrawal event
 */
export interface RevenueWithdrawnEvent {
  /** Recipient address */
  recipient: string;
  /** Amount withdrawn */
  amount: bigint;
  /** Block information */
  block: {
    number: bigint;
    timestamp: bigint;
  };
  /** Transaction information */
  transaction: {
    hash: string;
  };
}

/**
 * Ownership transfer event
 */
export interface OwnershipTransferredEvent {
  /** Previous owner */
  previousOwner: string;
  /** New owner */
  newOwner: string;
  /** Block information */
  block: {
    number: bigint;
    timestamp: bigint;
  };
  /** Transaction information */
  transaction: {
    hash: string;
  };
}

/**
 * ========================================
 * SERIALIZED TYPES (for API responses)
 * ========================================
 */

/**
 * Serialized PaymasterContract (BigInt -> string)
 */
export interface SerializedPaymasterContract {
  id: string;
  contractType: PaymasterType;
  address: string;
  network: string;
  chainId: string;
  totalUsersDeposit: string;
  currentDeposit: string;
  revenue: string;
  deployedAtBlock: string;
  deployedAtTransaction: string;
  deployedAtTimestamp: string;
  pools: SerializedPool[];
  userOperations: SerializedUserOperation[];
  revenueWithdrawals: SerializedRevenueWithdrawal[];
  lastUpdatedBlock: string;
  lastUpdatedTimestamp: string;
}

/**
 * Serialized Pool (BigInt -> string)
 */
export interface SerializedPool {
  id: string;
  poolId: string;
  paymaster: SerializedPaymasterContract;
  network: string;
  chainId: string;
  joiningFee: string;
  totalDeposits: string;
  memberCount: string;
  currentMerkleRoot: string;
  currentRootIndex: number;
  rootHistoryCount: number;
  createdAtBlock: string;
  createdAtTransaction: string;
  createdAtTimestamp: string;
  members: SerializedPoolMember[];
  userOperations: SerializedUserOperation[];
  merkleRoots: SerializedMerkleRoot[];
  lastUpdatedBlock: string;
  lastUpdatedTimestamp: string;
}

/**
 * Serialized PoolMember (BigInt -> string)
 */
export interface SerializedPoolMember {
  id: string;
  pool: SerializedPool;
  network: string;
  chainId: string;
  memberIndex: string;
  identityCommitment: string;
  merkleRootWhenAdded: string;
  rootIndexWhenAdded: number;
  addedAtBlock: string;
  addedAtTransaction: string;
  addedAtTimestamp: string;
  gasUsed?: string;
  nullifierUsed?: boolean;
  nullifier?: string;
}

/**
 * Serialized MerkleRoot (BigInt -> string)
 */
export interface SerializedMerkleRoot {
  id: string;
  pool: SerializedPool;
  network: string;
  chainId: string;
  root: string;
  rootIndex: number;
  createdAtBlock: string;
  createdAtTransaction: string;
  createdAtTimestamp: string;
}

/**
 * Serialized UserOperation (BigInt -> string)
 */
export interface SerializedUserOperation {
  id: string;
  userOpHash: string;
  paymaster: SerializedPaymasterContract;
  pool: SerializedPool;
  network: string;
  chainId: string;
  sender: string;
  actualGasCost: string;
  nullifier: string;
  executedAtBlock: string;
  executedAtTransaction: string;
  executedAtTimestamp: string;
  gasPrice?: string;
  totalGasUsed?: string;
}

/**
 * Serialized RevenueWithdrawal (BigInt -> string)
 */
export interface SerializedRevenueWithdrawal {
  id: string;
  paymaster: SerializedPaymasterContract;
  network: string;
  chainId: string;
  recipient: string;
  amount: string;
  withdrawnAtBlock: string;
  withdrawnAtTransaction: string;
  withdrawnAtTimestamp: string;
}

/**
 * Serialized NullifierUsage (BigInt -> string)
 */
export interface SerializedNullifierUsage {
  id: string;
  nullifier: string;
  paymaster: SerializedPaymasterContract;
  pool: SerializedPool;
  network: string;
  chainId: string;
  isUsed: boolean;
  gasUsed: string;
  userOperation?: SerializedUserOperation;
  firstUsedAtBlock?: string;
  firstUsedAtTransaction?: string;
  firstUsedAtTimestamp?: string;
  lastUpdatedBlock: string;
  lastUpdatedTimestamp: string;
}

/**
 * Serialized DailyPoolStats (BigInt -> string)
 */
export interface SerializedDailyPoolStats {
  id: string;
  date: string;
  pool: SerializedPool;
  network: string;
  chainId: string;
  newMembers: string;
  userOperations: string;
  gasSpent: string;
  revenueGenerated: string;
  totalMembers: string;
  totalDeposits: string;
}

/**
 * Serialized DailyGlobalStats (BigInt -> string)
 */
export interface SerializedDailyGlobalStats {
  id: string;
  date: string;
  network: string;
  chainId: string;
  newPools: string;
  totalNewMembers: string;
  totalUserOperations: string;
  totalGasSpent: string;
  totalRevenueGenerated: string;
  totalActivePools: string;
  totalMembers: string;
}

/**
 * Serialized NetworkInfo (BigInt -> string)
 */
export interface SerializedNetworkInfo {
  id: string;
  name: string;
  chainId: string;
  totalPaymasters: string;
  totalPools: string;
  totalMembers: string;
  totalUserOperations: string;
  totalGasSpent: string;
  totalRevenue: string;
  firstDeploymentBlock: string;
  firstDeploymentTimestamp: string;
  lastActivityBlock: string;
  lastActivityTimestamp: string;
}

/**
 * ========================================
 * RESPONSE WRAPPER TYPES
 * ========================================
 */

/**
 * Standard subgraph response wrapper
 */
export interface SubgraphResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: Array<string | number>;
  }>;
}

/**
 * Network metadata for client configuration
 */
export interface NetworkMetadata {
  /** Network name */
  network: string;
  /** Chain ID */
  chainId: number;
  /** Chain name (e.g., "Base Sepolia") */
  chainName: string;
  /** Network name for display */
  networkName: string;
  /** Contract addresses */
  contracts: {
    /** Paymaster contracts by type */
    paymasters: {
      gasLimited?: string;
      oneTimeUse?: string;
    };
    /** Verifier contract (if applicable) */
    verifier?: string;
  };
}

/**
 * ========================================
 * UTILITY TYPES
 * ========================================
 */

/**
 * Supported network names
 */
export type NetworkName = "base-sepolia" | "base" | "ethereum" | "sepolia";

/**
 * Supported chain IDs
 */
export type ChainId = 84532 | 8453 | 1 | 11155111;

/**
 * Entity types for type guards
 */
export type EntityType =
  | "PaymasterContract"
  | "Pool"
  | "PoolMember"
  | "MerkleRoot"
  | "UserOperation"
  | "RevenueWithdrawal"
  | "NullifierUsage"
  | "DailyPoolStats"
  | "DailyGlobalStats"
  | "NetworkInfo";

/**
 * Common entity fields
 */
export interface BaseEntity {
  id: string;
  network: string;
  chainId: bigint;
}

/**
 * Timestamped entity fields
 */
export interface TimestampedEntity extends BaseEntity {
  lastUpdatedBlock: bigint;
  lastUpdatedTimestamp: bigint;
}

/**
 * Created entity fields
 */
export interface CreatedEntity extends BaseEntity {
  createdAtBlock: bigint;
  createdAtTransaction: string;
  createdAtTimestamp: bigint;
}
