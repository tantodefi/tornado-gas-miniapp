/**
 * Core subgraph entity types - exact match to GraphQL schema
 * These types represent the raw data structure from The Graph Protocol
 * Updated for new paymaster subgraph structure
 */

/**
 * PaymasterContract entity from subgraph
 * Represents a deployed paymaster contract (GasLimited or OneTimeUse)
 */
export interface PaymasterContract {
  /** Contract address as ID */
  id: string;
  /** Contract type: "GasLimited" or "OneTimeUse" */
  contractType: string;
  /** Contract address */
  address: string;
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
 * Pool entity from subgraph
 * Represents a gas payment pool with all members and configuration
 */
export interface Pool {
  /** Pool ID as string */
  id: string;
  /** Numeric pool ID */
  poolId: bigint;
  /** Paymaster contract that manages this pool */
  paymaster: PaymasterContract;
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
 * Pool member entity from subgraph
 */
export interface PoolMember {
  /** Pool ID + Member Index as ID */
  id: string;
  /** Pool this member belongs to */
  pool: Pool;
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
 * MerkleRoot entity from subgraph
 * Replaces the old MerkleRootHistory entity
 */
export interface MerkleRoot {
  /** Pool ID + Root Index as ID */
  id: string;
  /** Pool this root belongs to */
  pool: Pool;
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
 * UserOperation entity from subgraph
 * Represents a sponsored user operation
 */
export interface UserOperation {
  /** User operation hash as ID */
  id: string;
  /** User operation hash */
  userOpHash: string;
  /** Paymaster that sponsored this operation */
  paymaster: PaymasterContract;
  /** Pool used for this operation */
  pool: Pool;
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
 * RevenueWithdrawal entity from subgraph
 * Represents a revenue withdrawal from a paymaster
 */
export interface RevenueWithdrawal {
  /** Transaction hash + log index as ID */
  id: string;
  /** Paymaster that withdrew revenue */
  paymaster: PaymasterContract;
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
 * NullifierUsage entity from subgraph
 * Tracks nullifier usage for gas limiting and one-time use
 */
export interface NullifierUsage {
  /** Nullifier as ID */
  id: string;
  /** Nullifier value */
  nullifier: bigint;
  /** Paymaster contract */
  paymaster: PaymasterContract;
  /** Pool where nullifier was used */
  pool: Pool;
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
 * DailyPoolStats entity from subgraph
 * Daily aggregated statistics for individual pools
 */
export interface DailyPoolStats {
  /** Date (YYYY-MM-DD) + Pool ID as ID */
  id: string;
  /** Date */
  date: string;
  /** Pool */
  pool: Pool;
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
 * DailyGlobalStats entity from subgraph
 * Daily aggregated statistics across all pools and paymasters
 */
export interface DailyGlobalStats {
  /** Date (YYYY-MM-DD) as ID */
  id: string;
  /** Date */
  date: string;
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
 * Event entities - immutable event records
 * Updated to match new contract events
 */
export interface PoolCreatedEvent {
  id: string;
  poolId: bigint;
  joiningFee: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface MemberAddedEvent {
  id: string;
  poolId: bigint;
  memberIndex: bigint;
  identityCommitment: bigint;
  merkleTreeRoot: bigint;
  merkleRootIndex: number;
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
  merkleRootIndex: number;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface UserOpSponsoredEvent {
  id: string;
  userOpHash: string;
  poolId: bigint;
  sender: string;
  actualGasCost: bigint;
  nullifier: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
}

export interface RevenueWithdrawnEvent {
  id: string;
  recipient: string;
  amount: bigint;
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
    /** Map of contract types to addresses */
    paymasters: {
      gasLimited?: string;
      oneTimeUse?: string;
    };
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

/**
 * Paymaster contract types
 */
export type PaymasterType = "GasLimited" | "OneTimeUse";
