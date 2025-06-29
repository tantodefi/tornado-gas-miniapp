// src/client/types.ts
import { Address, PartialBy } from "viem";
import { UserOperation } from "viem/account-abstraction";
import { NetworkConfig } from "@workspace/data";

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
