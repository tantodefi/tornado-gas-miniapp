import { Address, Hex } from "viem";
import { PrepaidGasPaymasterMode } from "../utils/encoding.js";

/**
 * Pool membership proof structure for zero-knowledge verification
 */
export interface PoolMembershipProof {
  /** Depth of the Merkle tree */
  merkleTreeDepth: bigint;
  /** Root of the Merkle tree */
  merkleTreeRoot: bigint;
  /** Unique nullifier to prevent double-spending */
  nullifier: bigint;
  /** Message being signed (usually operation hash) */
  message: bigint;
  /** Scope of the proof (usually pool ID) */
  scope: bigint;
  /** ZK-SNARK proof points [pA.x, pA.y, pB.x0, pB.x1, pB.y0, pB.y1, pC.x, pC.y] */
  points: [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
}

/**
 * Paymaster configuration data
 */
export interface PaymasterConfig {
  /** Index of the Merkle root in pool history (0-63) */
  merkleRootIndex: number;
  /** Operation mode (validation or estimation) */
  mode: PrepaidGasPaymasterMode;
}

/**
 * Complete paymaster data structure
 */
export interface PaymasterData {
  /** Configuration settings */
  config: PaymasterConfig;
  /** Pool ID for the operation */
  poolId: bigint;
  /** Zero-knowledge proof of pool membership */
  proof: PoolMembershipProof;
}

/**
 * User gas tracking data
 */
export interface UserGasData {
  /** Total gas used by this user (tracked by nullifier) */
  gasUsed: bigint;
  /** Last Merkle root used by this user */
  lastMerkleRoot: bigint;
}

/**
 * Configuration for deploying a new PrepaidGasPaymaster contract
 */
export interface DeploymentConfig {
  /** EntryPoint contract address */
  entryPointAddress: Address;
  /** Verifier contract address for zero-knowledge proofs */
  verifierAddress: Address;
  /** Initial owner address (optional, defaults to deployer) */
  ownerAddress?: Address;
  /** Initial stake amount in wei (optional) */
  initialStake?: bigint;
  /** Unstake delay in seconds (optional, default: 1 day) */
  unstakeDelay?: number;
}

/**
 * Result of a successful contract deployment
 */
export interface DeploymentResult {
  /** Address of the deployed contract */
  address: Address;
  /** Transaction hash of the deployment */
  transactionHash: Hex;
  /** Block number where contract was deployed */
  blockNumber: bigint;
  /** Gas used for deployment */
  gasUsed: bigint;
}

/**
 * Pool statistics and metadata (business logic view)
 */
export interface PoolStats {
  /** Pool ID */
  poolId: bigint;
  /** Number of members in the pool */
  memberCount: bigint;
  /** Total deposits in the pool */
  totalDeposits: bigint;
  /** Fee required to join */
  joiningFee: bigint;
  /** Current Merkle tree root */
  currentRoot: bigint;
  /** Pool creation timestamp */
  createdAt: bigint;
  /** Pool creation block number */
  createdAtBlock: bigint;
}

/**
 * Gas usage statistics for a pool member
 */
export interface MemberGasStats {
  /** Member's nullifier (unique identifier) */
  nullifier: bigint;
  /** Total gas used */
  gasUsed: bigint;
  /** Remaining gas allowance */
  gasRemaining: bigint;
  /** Last operation timestamp */
  lastOperation?: bigint;
}

/**
 * Transaction options for contract interactions
 */
export interface TransactionOptions {
  /** Gas limit override */
  gasLimit?: bigint;
  /** Gas price override */
  gasPrice?: bigint;
  /** Max fee per gas (EIP-1559) */
  maxFeePerGas?: bigint;
  /** Max priority fee per gas (EIP-1559) */
  maxPriorityFeePerGas?: bigint;
  /** Nonce override */
  nonce?: bigint;
}
