// src/client/types.ts
import { Address, PartialBy } from "viem";
import { UserOperation } from "viem/account-abstraction";
import { NetworkConfig } from "@workspace/data";
import { SemaphoreProof } from "@semaphore-protocol/proof";
import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";

/**
 * Configuration options for the PrepaidGasPaymaster client
 */
export interface PrepaidGasPaymasterConfig {
  /** URL of the subgraph endpoint (required) */
  subgraphUrl: string;
  /** Network configuration */
  network: NetworkConfig;
  /** RPC URL for blockchain interactions (optional, will use default) */
  rpcUrl?: string;
  /** Default timeout for requests in milliseconds */
  timeout?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Parameters for getting paymaster stub data (v0.7 compatible)
 */
export type GetPaymasterStubDataV7Parameters = PartialBy<
  Pick<
    UserOperation<"0.7">,
    | "callData"
    | "callGasLimit"
    | "factory"
    | "factoryData"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "nonce"
    | "sender"
    | "preVerificationGas"
    | "verificationGasLimit"
  >,
  | "callGasLimit"
  | "factory"
  | "factoryData"
  | "maxFeePerGas"
  | "maxPriorityFeePerGas"
  | "preVerificationGas"
  | "verificationGasLimit"
> & {
  context?: unknown;
  chainId: number;
  entryPointAddress: Address;
};

/**
 * Input parameters for proof generation
 */
export interface ProofGenerationParams {
  /** Identity string (private key or commitment) */
  identityHex: `0x${string}`;
  /** Array of pool member identity commitments */
  poolMembers: bigint[];
  /** Message to sign (usually operation hash) */
  messageHash: bigint;
  /** Pool ID for proof scope */
  poolId: bigint;
}

/**
 * Result of proof generation
 */
export interface ProofGenerationResult {
  /** Generated Semaphore proof */
  proof: SemaphoreProof;
  /** Group that was used for proof generation */
  group: Group;
  /** Identity that was used for proof generation */
  identity: Identity;
}
